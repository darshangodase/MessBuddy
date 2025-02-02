const express = require('express');
const router = express.Router();
const { 
  getCurrentMealPass,
  validateMealPass
} = require('../controllers/meal_pass_controller');

router.get('/current/:userId', getCurrentMealPass);
router.post('/validate/:messId', validateMealPass);

module.exports = router; 