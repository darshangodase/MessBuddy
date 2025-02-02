const SubscriptionPlan = require('../models/subscription_plan');
const UserSubscription = require('../models/user_subscription');
const User = require('../models/user');
const { errorHandler } = require('../utils/error');
const crypto = require('crypto');
const MealPass = require('../models/meal_pass');
const Mess = require('../models/mess');

// Create a new subscription plan (Mess Owner)
exports.createPlan = async (req, res, next) => {
  try {
    const { planName, duration, mealType, price, description, userId } = req.body;

    const user = await User.findById(userId);
    if (!user || user.Login_Role !== 'Mess Owner') {
      return next(errorHandler(403, 'Only mess owners can create subscription plans'));
    }

    const newPlan = new SubscriptionPlan({
      messId: userId, // Using userId as messId since they're the same for mess owners
      planName,
      duration,
      mealType,
      price,
      description
    });

    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    next(error);
  }
};

// Update a subscription plan (Mess Owner)
exports.updatePlan = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const plan = await SubscriptionPlan.findById(req.params.planId);
    if (!plan) return next(errorHandler(404, 'Plan not found'));
    
    // Check if user is the mess owner who created the plan
    const user = await User.findById(userId);
    if (!user || user.Login_Role !== 'Mess Owner' || plan.messId.toString() !== userId) {
      return next(errorHandler(403, 'You can only update your own plans'));
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.planId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPlan);
  } catch (error) {
    next(error);
  }
};

// Delete a subscription plan (Mess Owner)
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.planId);
    if (!plan) return next(errorHandler(404, 'Plan not found'));

    if (plan.messId.toString() !== req.params.messId) {
      return next(errorHandler(403, 'You can only delete your own plans'));
    }

    // Find all subscriptions for this plan (not just active ones)
    await UserSubscription.updateMany(
      { 
        planId: req.params.planId,
      },
      { 
        $set: { 
          status: 'Plan Removed',
          endDate: new Date(),
          cancellationReason: 'Plan deleted by mess owner'
        }
      }
    );

    await SubscriptionPlan.findByIdAndDelete(req.params.planId);
    res.status(200).json({ message: 'Plan deleted successfully and related subscriptions updated' });
  } catch (error) {
    next(error);
  }
};

// Get all plans for a specific mess
exports.getMessPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ 
      messId: req.params.messId,
      isActive: true 
    });
    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
};

// Get all active plans (for users to browse)
exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true })
      .populate({
        path: 'messId',
        model: 'User',
        select: '_id'
      })
      .sort({ createdAt: -1 });

    // Get mess details for each plan
    const plansWithMessDetails = await Promise.all(plans.map(async (plan) => {
      const mess = await Mess.findOne({ Owner_ID: plan.messId });
      const planObj = plan.toObject();
      planObj.messDetails = mess;
      return planObj;
    }));

    res.status(200).json(plansWithMessDetails);
  } catch (error) {
    next(error);
  }
};

// Subscribe to a plan (User)
exports.subscribeToPlan = async (req, res, next) => {
  try {
    const { planId, userId } = req.body;

    const user = await User.findById(userId);
    if (!user || user.Login_Role !== 'User') {
      return next(errorHandler(403, 'Only users can subscribe to plans'));
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return next(errorHandler(404, 'Plan not found or inactive'));
    }

    // Check if user has ever subscribed to this specific plan
    const existingPlanSubscription = await UserSubscription.findOne({
      userId,
      planId
    });

    if (existingPlanSubscription) {
      return next(errorHandler(400, 'You have already subscribed to this plan before. Each plan can only be subscribed once.'));
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    switch (plan.duration) {
      case 'Daily':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'Weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'Monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }

    const newSubscription = new UserSubscription({
      userId,
      planId,
      startDate,
      endDate,
      status: 'Pending',
      paymentStatus: 'Pending'
    });

    const savedSubscription = await newSubscription.save();

    // Generate meal pass after successful subscription
    try {
      const qrData = {
        userId,
        subscriptionId: savedSubscription._id,
        planId: plan._id,
        messId: plan.messId,
        mealType: plan.mealType,
        timestamp: Date.now()
      };

      const qrString = crypto
        .createHash('sha256')
        .update(JSON.stringify(qrData))
        .digest('hex');

      const mealPass = new MealPass({
        userId,
        subscriptionId: savedSubscription._id,
        messId: plan.messId,
        qrCode: qrString,
        validFrom: startDate,
        validTill: endDate
      });

      await mealPass.save();
    } catch (error) {
      console.error('Failed to generate meal pass:', error);
    }

    res.status(201).json(savedSubscription);
  } catch (error) {
    next(error);
  }
};

// Get user's subscriptions
exports.getUserSubscriptions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const subscriptions = await UserSubscription.find({ userId })
      .populate({
        path: 'planId',
        populate: {
          path: 'messId',
          model: 'User',
          select: '_id'
        }
      })
      .sort({ createdAt: -1 });

    // Get mess details for each subscription
    const subscriptionsWithMessDetails = await Promise.all(subscriptions.map(async (sub) => {
      const subObj = sub.toObject();
      if (subObj.planId && subObj.planId.messId) {
        const mess = await Mess.findOne({ Owner_ID: subObj.planId.messId });
        if (mess) {
          subObj.planId.messDetails = mess;
        }
      }
      return subObj;
    }));

    res.status(200).json(subscriptionsWithMessDetails);
  } catch (error) {
    next(error);
  }
};

// Get mess subscribers (Mess Owner)
exports.getMessSubscribers = async (req, res, next) => {
  try {
    const subscriptions = await UserSubscription.find({
      // Remove status filter to get all subscriptions
    })
    .populate({
      path: 'planId',
      match: { messId: req.params.messId }
    })
    .populate('userId', 'username email')
    .sort({ createdAt: -1 });

    // Filter out subscriptions where planId is null (plans from other messes)
    const validSubscriptions = subscriptions.filter(sub => sub.planId !== null);

    res.status(200).json(validSubscriptions);
  } catch (error) {
    next(error);
  }
};

// Cancel subscription (User)
exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await UserSubscription.findById(req.params.subscriptionId);
    if (!subscription) {
      return next(errorHandler(404, 'Subscription not found'));
    }

    if (subscription.userId.toString() !== req.user.id) {
      return next(errorHandler(403, 'You can only cancel your own subscriptions'));
    }

    if (subscription.status !== 'Active') {
      return next(errorHandler(400, 'Subscription is not active'));
    }

    subscription.status = 'Cancelled';
    await subscription.save();

    res.status(200).json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// Activate subscription
exports.activateSubscription = async (req, res, next) => {
  try {
    const subscription = await UserSubscription.findById(req.params.subscriptionId);
    if (!subscription) {
      return next(errorHandler(404, 'Subscription not found'));
    }

    const plan = await SubscriptionPlan.findById(subscription.planId);
    if (!plan) {
      return next(errorHandler(404, 'Plan not found'));
    }

    // Check if the request is from the mess owner
    if (req.body.messId && plan.messId.toString() !== req.body.messId) {
      return next(errorHandler(403, 'Not authorized to update this subscription'));
    }

    // If status is provided in request body, use that
    if (req.body.status) {
      subscription.status = req.body.status;
      
      // Update end date if cancelling or expiring
      if (['Cancelled', 'Expired'].includes(req.body.status)) {
        subscription.endDate = new Date();
      } else if (req.body.status === 'Active') {
        // Reset dates for reactivation
        subscription.startDate = new Date();
        let endDate = new Date();
        switch (plan.duration) {
          case 'Daily':
            endDate.setDate(endDate.getDate() + 1);
            break;
          case 'Weekly':
            endDate.setDate(endDate.getDate() + 7);
            break;
          case 'Monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
        }
        subscription.endDate = endDate;
      }
    } else {
      // Original activation logic
      subscription.startDate = new Date();
      let endDate = new Date();

      // Calculate end date based on plan duration
      switch (plan.duration) {
        case 'Daily':
          endDate.setDate(endDate.getDate() + 1);
          break;
        case 'Weekly':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'Monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
      }

      subscription.endDate = endDate;
    }

    await subscription.save();
    res.status(200).json(subscription);
  } catch (error) {
    next(error);
  }
};

// Add a cron job or scheduled task to check for expired subscriptions
const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    const expiredSubscriptions = await UserSubscription.find({
      status: 'Active',
      endDate: { $lt: now }
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'Expired';
      await subscription.save();
    }
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
};

// Run this check periodically (e.g., daily)
setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000); 