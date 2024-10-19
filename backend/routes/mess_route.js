const express = require('express');
const router = express.Router();
const Mess = require('../models/mess');
const errorhandler = require('../utils/error');
const { verifyToken, verifyMessOwner } = require('../middleware/auth');

// Create a new mess
router.post('/create', verifyToken, verifyMessOwner, async (req, res, next) => {
  const { Mess_Name, Mobile_No, Capacity, Address, Description, Menu } = req.body;
  const Owner_ID = req.user.id;

  try {
    const newMess = new Mess({
      Mess_ID: Date.now(), // Generate a unique Mess_ID
      Mess_Name,
      Mobile_No,
      Capacity,
      Address,
      Owner_ID,
      Description,
      Menu,
    });

    await newMess.save();
    res.status(201).json({ success: true, message: 'Mess created successfully', mess: newMess });
  } catch (error) {
    console.error('Create mess error:', error);
    next(errorhandler(500, 'Internal Server Error'));
  }
});

// Get all messes
router.get('/', async (req, res, next) => {
  try {
    const messes = await Mess.find();
    res.status(200).json({ success: true, messes });
  } catch (error) {
    console.error('Get messes error:', error);
    next(errorhandler(500, 'Internal Server Error'));
  }
});

// Get a single mess by ID
router.get('/:id', async (req, res, next) => {
  try {
    const mess = await Mess.findOne({ Mess_ID: req.params.id });
    if (!mess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    res.status(200).json({ success: true, mess });
  } catch (error) {
    console.error('Get mess error:', error);
    next(errorhandler(500, 'Internal Server Error'));
  }
});

// Update a mess
router.put('/:id', verifyToken, verifyMessOwner, async (req, res, next) => {
  const { Mess_Name, Mobile_No, Capacity, Address, Description, Menu } = req.body;

  try {
    const updatedMess = await Mess.findOneAndUpdate(
      { Mess_ID: req.params.id, Owner_ID: req.user.id },
      { Mess_Name, Mobile_No, Capacity, Address, Description, Menu },
      { new: true }
    );
    if (!updatedMess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    res.status(200).json({ success: true, message: 'Mess updated successfully', mess: updatedMess });
  } catch (error) {
    console.error('Update mess error:', error);
    next(errorhandler(500, 'Internal Server Error'));
  }
});

// Delete a mess
router.delete('/:id', verifyToken, verifyMessOwner, async (req, res, next) => {
  try {
    const deletedMess = await Mess.findOneAndDelete({ Mess_ID: req.params.id, Owner_ID: req.user.id });
    if (!deletedMess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    res.status(200).json({ success: true, message: 'Mess deleted successfully' });
  } catch (error) {
    console.error('Delete mess error:', error);
    next(errorhandler(500, 'Internal Server Error'));
  }
});

module.exports = router;