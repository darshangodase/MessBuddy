const Mess = require('../models/mess');
const errorhandler = require('../utils/error');

const createMess = async (req, res, next) => {
  const { Mess_Name, Mobile_No, Capacity, Address, Description } = req.body;
  const Owner_ID = req.params.ownerId;

  try {
    const newMess = new Mess({
      Mess_ID: Date.now(),
      Mess_Name,
      Mobile_No,
      Capacity,
      Address,
      Owner_ID,
      Description,
    });

    await newMess.save();
    res.status(201).json({ success: true, message: 'Mess created successfully', mess: newMess });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const updateMess = async (req, res, next) => {
  const { Mess_Name, Mobile_No, Capacity, Address, Description } = req.body;
  const Owner_ID = req.params.ownerId;
  try {
    const updatedMess = await Mess.findOneAndUpdate(
      { Owner_ID },
      { Mess_Name, Mobile_No, Capacity, Address, Description },
      { new: true }
    );
    if (!updatedMess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    res.status(200).json({ success: true, message: 'Mess updated successfully', mess: updatedMess });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const getAllMess = async (req, res, next) => {
  
  const { searchTerm } = req.query;
  
  try {
    const filter = searchTerm
      ? { Mess_Name: { $regex: searchTerm, $options: 'i' } }
      : {};
    const messes = await Mess.find(filter);
    if (messes.length === 0) {
      return res.status(404).json({ success: false, message: 'No messes found' });
    }
    res.status(200).json({
      success: true,
      messes,
    });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const getMess = async (req, res, next) => {
  try {
    const mess = await Mess.findOne({ Owner_ID: req.params.id });
    if (!mess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    res.status(200).json({ success: true, mess });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};
const readMess = async (req, res, next) => {
  try {
    const mess = await Mess.findOne({ _id: req.params.id });
    if (!mess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    res.status(200).json({ success: true, mess });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const deleteMess = async (req, res, next) => {
  try {
    const deletedMess = await Mess.findOneAndDelete({ Owner_ID: req.params.id });
    if (!deletedMess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    res.status(200).json({ success: true, message: 'Mess deleted successfully' });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};
const getRating = async (req, res, next) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    const averageRating = mess.Ratings.length > 0
      ? mess.Ratings.reduce((acc, rating) => acc + rating, 0) / mess.Ratings.length
      : 0;
    res.status(200).json({ success: true, rating: averageRating });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
};

const updateRating = async (req, res, next) => {
  const { rating } = req.body;
  const {id,userId} = req.params; 
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }
    if (mess.RatedBy.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User has already rated this mess' });
    }
    mess.Ratings.push(rating);
    mess.RatedBy.push(userId);
    await mess.save();
    const averageRating = mess.Ratings.reduce((acc, rating) => acc + rating, 0) / mess.Ratings.length;
    res.status(200).json({ success: true, message: 'Rating updated successfully', rating: averageRating });
  } catch (error) {
    next(errorhandler(500, 'Internal Server Error'));
  }
}

module.exports = {
  createMess,
  getAllMess,
  getMess,
  updateMess,
  deleteMess,
  readMess,
  getRating,
  updateRating,
};