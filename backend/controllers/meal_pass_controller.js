const MealPass = require('../models/meal_pass');
const UserSubscription = require('../models/user_subscription');
const { errorHandler } = require('../utils/error');
const QRCode = require('qrcode');
const crypto = require('crypto');
const Mess = require('../models/mess');

exports.generateMealPass = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    const subscription = await UserSubscription.findById(subscriptionId)
      .populate('plan_id')
      .populate('mess_id');

    if (!subscription) {
      return next(errorHandler(404, 'Subscription not found'));
    }

    // Generate unique QR code data
    const qrData = {
      userId,
      subscriptionId,
      messId: subscription.mess_id._id,
      timestamp: Date.now()
    };

    // Encrypt QR data
    const qrString = crypto
      .createHash('sha256')
      .update(JSON.stringify(qrData))
      .digest('hex');

    // Generate QR code
    const qrCode = await QRCode.toDataURL(qrString);

    // Create meal pass
    const mealPass = new MealPass({
      userId,
      subscriptionId,
      messId: subscription.mess_id._id,
      qrCode: qrString,
      validFrom: subscription.start_date,
      validTill: subscription.end_date
    });

    await mealPass.save();

    res.status(201).json({
      mealPass,
      qrCode
    });
  } catch (error) {
    next(error);
  }
};

exports.validateMealPass = async (req, res, next) => {
  try {
    const { qrCode } = req.body;
    const { messId } = req.params;

    if (!messId) {
      return next(errorHandler(401, 'Mess ID is required'));
    }

    const mealPass = await MealPass.findOne({ qrCode })
      .populate('userId')
      .populate({
        path: 'subscriptionId',
        populate: {
          path: 'planId',
          model: 'SubscriptionPlan'
        }
      });

    if (!mealPass) {
      return next(errorHandler(404, 'Invalid QR code'));
    }

    if (mealPass.messId.toString() !== messId) {
      return next(errorHandler(403, 'QR code not valid for this mess'));
    }

    if (mealPass.isBlocked) {
      return next(errorHandler(403, 'User is blocked'));
    }

    // Check subscription status
    if (!mealPass.subscriptionId || mealPass.subscriptionId.status !== 'Active') {
      return next(errorHandler(403, 'Subscription is not active'));
    }

    if (!mealPass.isActive || Date.now() > mealPass.validTill) {
      return next(errorHandler(403, 'Subscription expired'));
    }

    res.status(200).json({ valid: true, mealPass });
  } catch (error) {
    next(error);
  }
};

// Get current meal passes
exports.getCurrentMealPass = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return next(errorHandler(401, 'User ID is required'));
    }

    const mealPasses = await MealPass.find({
      userId,
      isActive: true,
      validTill: { $gt: new Date() }
    })
    .populate({
      path: 'messId',
      model: 'User',
      select: '_id'
    })
    .populate({
      path: 'subscriptionId',
      populate: {
        path: 'planId',
        model: 'SubscriptionPlan'
      }
    });

    // Get mess details for each meal pass
    const mealPassesWithMessDetails = await Promise.all(mealPasses.map(async (pass) => {
      const passObj = pass.toObject();
      const mess = await Mess.findOne({ Owner_ID: pass.messId });
      if (mess) {
        passObj.messDetails = mess;
      }
      return passObj;
    }));

    if (!mealPassesWithMessDetails.length) {
      return next(errorHandler(404, 'No active meal passes found'));
    }

    res.status(200).json(mealPassesWithMessDetails);
  } catch (error) {
    next(error);
  }
}; 