const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         name:
 *           type: string
 *           description: User name
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the user was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: Date when the user was last updated
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.registerUser
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid credentials
 *       500:
 *         description: Server error
 */
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.loginUser
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       500:
 *         description: Server error
 */
router.get('/me', auth, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       500:
 *         description: Server error
 */
router.put(
  '/update',
  [
    auth,
    [
      check('name', 'Name is required').optional(),
      check('email', 'Please include a valid email').optional().isEmail()
    ]
  ],
  authController.updateUser
);

/**
 * @swagger
 * /api/auth/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       500:
 *         description: Server error
 */
router.delete('/delete', auth, authController.deleteAccount);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset (forgot password)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password/{resettoken}:
 *   put:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: resettoken
 *         schema:
 *           type: string
 *         required: true
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Bad request - validation error or invalid token
 *       500:
 *         description: Server error
 */
router.put(
  '/reset-password/:resettoken',
  [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.resetPassword
);

/**
 * @swagger
 * /api/auth/update-password:
 *   put:
 *     summary: Update password (when logged in)
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - no token, invalid token, or wrong current password
 *       500:
 *         description: Server error
 */
router.put(
  '/update-password',
  [
    auth,
    [
      check('currentPassword', 'Current password is required').exists(),
      check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ]
  ],
  authController.updatePassword
);

module.exports = router;