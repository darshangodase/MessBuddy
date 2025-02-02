const express = require('express');
const router = express.Router();
const {
  createPlan,
  updatePlan,
  deletePlan,
  getMessPlans,
  getAllPlans,
  subscribeToPlan,
  getUserSubscriptions,
  getMessSubscribers,
  cancelSubscription,
  activateSubscription
} = require('../controllers/subscription_controller');

// Mess owner routes
router.post('/plans', createPlan);//working
router.put('/plans/:planId', updatePlan);//working
router.delete('/plans/:planId/:messId', deletePlan);//working
router.get('/mess/:messId/plans', getMessPlans);//working
router.get('/mess/:messId/subscribers', getMessSubscribers);

// User routes
router.get('/plans', getAllPlans);//working
router.post('/subscribe', subscribeToPlan);
router.get('/user/:userId', getUserSubscriptions);
router.put('/cancel/:subscriptionId', cancelSubscription);
router.put('/:subscriptionId/activate', activateSubscription);

module.exports = router; 