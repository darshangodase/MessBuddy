const express = require('express');
const router = express.Router();
const { 
  createCheckIn,
  getCheckIns,
  getTodayStats
} = require('../controllers/check_in_controller');

router.post('/:messId', createCheckIn);
router.get('/:messId', getCheckIns);
router.get('/today-stats/:messId', getTodayStats);

module.exports = router; 