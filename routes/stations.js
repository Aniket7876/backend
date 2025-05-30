const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const stationController = require('../controllers/stationController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Station:
 *       type: object
 *       required:
 *         - name
 *         - location
 *         - powerOutput
 *         - connectorType
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the station
 *         name:
 *           type: string
 *           description: Name of the charging station
 *         location:
 *           type: object
 *           required:
 *             - latitude
 *             - longitude
 *           properties:
 *             latitude:
 *               type: number
 *               description: Latitude coordinate
 *             longitude:
 *               type: number
 *               description: Longitude coordinate
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *           default: Active
 *           description: Current status of the station
 *         powerOutput:
 *           type: number
 *           description: Power output in kW
 *         connectorType:
 *           type: string
 *           description: Type of charging connector
 *         owner:
 *           type: string
 *           description: ID of the user who owns the station
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the station was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: Date when the station was last updated
 */

/**
 * @swagger
 * /api/stations:
 *   post:
 *     summary: Create a new charging station
 *     tags: [Stations]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - powerOutput
 *               - connectorType
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 default: Active
 *               powerOutput:
 *                 type: number
 *               connectorType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Station created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('location.latitude', 'Latitude is required').not().isEmpty(),
      check('location.longitude', 'Longitude is required').not().isEmpty(),
      check('powerOutput', 'Power output is required').not().isEmpty(),
      check('connectorType', 'Connector type is required').not().isEmpty()
    ]
  ],
  stationController.createStation
);

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Get all charging stations
 *     tags: [Stations]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of all charging stations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       500:
 *         description: Server error
 */
router.get('/', auth, stationController.getStations);

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Get a charging station by ID
 *     tags: [Stations]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the charging station
 *     responses:
 *       200:
 *         description: Details of the charging station
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, stationController.getStationById);

/**
 * @swagger
 * /api/stations/{id}:
 *   put:
 *     summary: Update a charging station
 *     tags: [Stations]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the charging station to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               powerOutput:
 *                 type: number
 *               connectorType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Station updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').optional(),
      check('location', 'Location must be an object with latitude and longitude').optional(),
      check('status', 'Status must be either Active or Inactive').optional().isIn(['Active', 'Inactive']),
      check('powerOutput', 'Power output must be a number').optional().isNumeric(),
      check('connectorType', 'Connector type is required').optional()
    ]
  ],
  stationController.updateStation
);

/**
 * @swagger
 * /api/stations/{id}:
 *   delete:
 *     summary: Delete a charging station
 *     tags: [Stations]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the charging station to delete
 *     responses:
 *       200:
 *         description: Station deleted successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, stationController.deleteStation);

module.exports = router;