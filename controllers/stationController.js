const ChargingStation = require('../models/ChargingStation');
const { validationResult } = require('express-validator');

// @route   POST /api/stations
// @desc    Create a charging station
// @access  Private
exports.createStation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, location, status, powerOutput, connectorType } = req.body;

    const newStation = new ChargingStation({
      name,
      location,
      status,
      powerOutput,
      connectorType,
      createdBy: req.user.id
    });

    const station = await newStation.save();
    res.json(station);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/stations
// @desc    Get all charging stations
// @access  Private
exports.getStations = async (req, res) => {
  try {
    const stations = await ChargingStation.find().sort({ createdAt: -1 });
    res.json(stations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/stations/:id
// @desc    Get charging station by ID
// @access  Private
exports.getStationById = async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ msg: 'Charging station not found' });
    }

    res.json(station);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/stations/:id
// @desc    Update a charging station
// @access  Private
exports.updateStation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, location, status, powerOutput, connectorType } = req.body;

    // Build station object
    const stationFields = {};
    if (name) stationFields.name = name;
    if (location) stationFields.location = location;
    if (status) stationFields.status = status;
    if (powerOutput) stationFields.powerOutput = powerOutput;
    if (connectorType) stationFields.connectorType = connectorType;
    stationFields.updatedAt = Date.now();

    let station = await ChargingStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ msg: 'Charging station not found' });
    }

    // Make sure user owns the station
    if (station.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    station = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      { $set: stationFields },
      { new: true }
    );

    res.json(station);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   DELETE /api/stations/:id
// @desc    Delete a charging station
// @access  Private
exports.deleteStation = async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ msg: 'Charging station not found' });
    }

    // Make sure user owns the station
    if (station.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await ChargingStation.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Charging station removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    res.status(500).send('Server error');
  }
};