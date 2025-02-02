const mongoose = require('mongoose');
const CheckIn = require('../models/check_in');
const MealPass = require('../models/meal_pass');
const { errorHandler } = require('../utils/error');

// Create new check-in
exports.createCheckIn = async (req, res, next) => {
  try {
    const { mealPassId, mealType } = req.body;
    const { _id: messId } = req.params; // Get messId from params


    const mealPass = await MealPass.findById(mealPassId)
      .populate('subscriptionId');
      
    if (!mealPass) {
      return next(errorHandler(404, 'Meal pass not found'));
    }

    if (!mealPass.isActive || mealPass.isBlocked) {
      return next(errorHandler(403, 'Meal pass is inactive or blocked'));
    }

    // Check subscription status
    if (!mealPass.subscriptionId || mealPass.subscriptionId.status !== 'Active') {
      return next(errorHandler(403, 'Subscription is not active'));
    }

    // Check if already checked in for this meal
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await CheckIn.findOne({
      mealPassId,
      mealType,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingCheckIn) {
      return next(errorHandler(400, 'Already checked in for this meal'));
    }

    const checkIn = new CheckIn({
      userId: mealPass.userId,
      messId: mealPass.messId,
      mealPassId,
      mealType: mealType.toLowerCase(), // Ensure consistent case
      status: 'success'
    });

    const savedCheckIn = await checkIn.save();

    res.status(201).json(savedCheckIn);
  } catch (error) {
    console.error('Error creating check-in:', error);
    next(error);
  }
};

// Get check-ins with filters
exports.getCheckIns = async (req, res, next) => {
  try {
    const { messId, userId, date, mealType } = req.query;
    const query = {};

    if (messId) query.messId = messId;
    if (userId) query.userId = userId;
    if (mealType) query.mealType = mealType;
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.createdAt = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    const checkIns = await CheckIn.find(query)
      .populate('userId', 'username')
      .populate({
        path: 'mealPassId',
        populate: {
          path: 'subscriptionId',
          populate: {
            path: 'planId',
            select: 'planName'
          }
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(checkIns);
  } catch (error) {
    next(error);
  }
};

// Get today's check-in stats for a mess
exports.getTodayStats = async (req, res, next) => {
  try {
    const { messId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // First, let's check if we have any check-ins for today
    const todayCheckIns = await CheckIn.find({
      messId: new mongoose.Types.ObjectId(messId),
      createdAt: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'success'
    });


    const stats = await CheckIn.aggregate([
      {
        $match: {
          messId: new mongoose.Types.ObjectId(messId),
          createdAt: {
            $gte: today,
            $lt: tomorrow
          },
          status: 'success'
        }
      },
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 }
        }
      }
    ]);

 

    const formattedStats = {
      breakfast: 0,
      lunch: 0,
      dinner: 0
    };

    stats.forEach(stat => {
      if (stat._id) {
        const mealType = stat._id.toLowerCase();
        formattedStats[mealType] = stat.count;
      }
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    console.error('Error getting today stats:', error);
    console.error('MessId:', req.params.messId); // Debug log
    next(error);
  }
}; 