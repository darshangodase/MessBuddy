const express = require('express');
const router = express.Router();
const { createFeedback,getAllFeedbacks} = require('../controllers/feedback_controller');

router.post('/', createFeedback);
router.get('/', getAllFeedbacks);

module.exports = router;
