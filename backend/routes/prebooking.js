// backend/routes/prebooking.js
const express = require('express');
const router = express.Router();
const Prebooking = require('../models/Prebooking');
const Menu = require('../models/menu');  
const Mess = require('../models/mess');  
const User = require('../models/user'); 

// Create a new prebooking
router.post('/', async (req, res) => {
  const { menuId, messId, userId, date, time } = req.body;

  try {
    const prebooking = new Prebooking({
      menuId,
      messId,
      userId,
      date,
      time,
      status: "Pending", // Default status for new prebooking
    });

    await prebooking.save();
    res.status(200).json(prebooking);
  } catch (error) {
    console.error("Error during prebooking:", error);
    res.status(500).send("Error during prebooking.");
  }
});



// Get prebookings for a user
router.get('/:userId', async (req, res) => {
  try {
    const prebookings = await Prebooking.find({ userId: req.params.userId })
      .populate('menuId')
      .populate('messId'); 
      res.status(200).json(prebookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get prebookings for a mess
router.get('/mess/:messId', async (req, res) => {
  try {
    const prebookings = await Prebooking.find({ messId: req.params.messId })
      .populate('menuId')
      .populate('userId');  // Populate user details
    res.status(200).json(prebookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update prebooking status (e.g., Confirm or Cancel)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;  // Expect status as 'Confirmed' or 'Cancelled'
    
    // Ensure status is one of the valid options
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    // Update the prebooking status
    const prebooking = await Prebooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }  // Return the updated document
    );

    if (!prebooking) {
      return res.status(404).json({ message: 'Prebooking not found' });
    }

    res.status(200).json(prebooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
