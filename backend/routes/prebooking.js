// backend/routes/prebooking.js
const express = require('express');
const router = express.Router();
const Prebooking = require('../models/Prebooking');
const nodemailer = require("nodemailer");


// Create a new prebooking
router.post('/', async (req, res) => {
  const { menuId, messId, userId, date, time, quantity } = req.body;

  try {
    // Create a new prebooking entry
    const prebooking = new Prebooking({
      menuId,
      messId,
      userId,
      date,
      time,
      quantity,
      status: "Pending", 
    });

    await prebooking.save();
    const populatedPrebooking = await Prebooking.findById(prebooking._id)
      .populate('userId')
      .populate('messId');

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailText = `Dear ${populatedPrebooking.userId.username},\n\nThank you for your prebooking request with ${populatedPrebooking.messId.Mess_Name}.\n\nYour prebooking details are as follows:\n- Date: ${populatedPrebooking.date}\n- Time: ${populatedPrebooking.time}\n- Quantity: ${populatedPrebooking.quantity}\n- Mess Name: ${populatedPrebooking.messId.Mess_Name}\n\nYour request has been successfully submitted and is currently under review. You will receive an email notification once your prebooking status is updated.\n\nIf you have any questions or need to make changes, feel free to contact us.\n\nKind regards,\n${populatedPrebooking.messId.Mess_Name} Team`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: populatedPrebooking.userId.email, // User's email from populated userId
      subject: "Prebooking Confirmation",
      text: emailText,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "Prebooking created successfully, and email notification sent.",
      prebooking: populatedPrebooking,
    });
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
router.get('/', async (req, res) => {
  
  try {
    const prebookings = await Prebooking.find({})
    res.status(200).json({prebooking:prebookings});
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
    const { status } = req.body;

    // Ensure status is one of the valid options
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    // Find the prebooking with populated user and mess information
    const prebooking = await Prebooking.findById(req.params.id)
      .populate('userId')
      .populate('messId'); // Populates mess details

    if (!prebooking) {
      return res.status(404).json({ message: 'Prebooking not found' });
    }

    // Update the status
    prebooking.status = status;
    await prebooking.save();

    // Create the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Generate a professional email message with prebooking details and mess name
    const emailMessages = {
      Pending: `Dear ${prebooking.userId.username},\n\nThank you for your prebooking with ${prebooking.messId.Mess_Name}. We have received your request and it is currently pending. Please allow us some time to process it.\n\nPrebooking Details:\n- Date: ${prebooking.date}\n- Time: ${prebooking.time}\n- Quantity: ${prebooking.quantity}\n- Mess Name: ${prebooking.messId.Mess_Name}\n\nYou will receive another email once your prebooking status is updated.\n\nKind regards,\n${prebooking.messId.Mess_Name} Team`,

      Confirmed: `Dear ${prebooking.userId.username},\n\nWe are pleased to inform you that your prebooking with ${prebooking.messId.Mess_Name} has been confirmed!\n\nPrebooking Details:\n- Date: ${prebooking.date}\n- Time: ${prebooking.time}\n- Quantity: ${prebooking.quantity}\n- Mess Name: ${prebooking.messId.Mess_Name}\n\nWe look forward to serving you. If you have any questions or need to make changes, feel free to contact us.\n\nKind regards,\n${prebooking.messId.Mess_Name} Team`,

      Cancelled: `Dear ${prebooking.userId.username},\n\nWe regret to inform you that your prebooking with ${prebooking.messId.Mess_Name} has been cancelled.\n\nPrebooking Details:\n- Date: ${prebooking.date}\n- Time: ${prebooking.time}\n- Quantity: ${prebooking.quantity}\n- Mess Name: ${prebooking.messId.Mess_Name}\n\nIf you have any questions or believe this was done in error, please reach out to us.\n\nKind regards,\n${prebooking.messId.Mess_Name} Team`,
    };

    const emailText = emailMessages[status];

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: prebooking.userId.email,
      subject: `Prebooking Status Update: ${status}`,
      text: emailText, 
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Prebooking status updated successfully, and email notification sent.",
      prebooking,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while updating the prebooking status.", details: err.message });
  }
});



router.delete('/:bookingId', async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    await Prebooking.findByIdAndDelete(bookingId); // Assuming you're using Mongoose
    res.status(200).json({ message: 'Prebooking deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting prebooking' });
  }
});


module.exports = router;
