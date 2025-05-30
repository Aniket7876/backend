const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password
    });

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/auth/update
// @desc    Update user profile
// @access  Private
exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email } = req.body;

  try {
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   DELETE /api/auth/delete
// @desc    Delete user account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndRemove(req.user.id);

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - generate token
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user; // Declare user variable outside try block

  try {
    user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });
    
    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    res.json({
      msg: 'Password reset token generated',
      resetUrl: resetUrl
    });
  } catch (err) {
    console.error(err.message);

    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      
      await user.save({ validateBeforeSave: false });
    }
    
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/auth/reset-password/:resettoken
// @desc    Reset password
// @access  Public
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: 'Password updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/auth/update-password
// @desc    Update password
// @access  Private
exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ msg: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
