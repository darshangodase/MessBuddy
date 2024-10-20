const express = require('express');
const router = express.Router();
const { createMess, getAllMess, getMess, updateMess, deleteMess ,readMess,getRating,updateRating} = require('../controllers/mess_controller');

router.post('/create/:ownerId', createMess);
router.put('/update/:ownerId', updateMess);
router.get('/', getAllMess);
router.get('/:id', getMess);
router.get('/read/:id', readMess);
router.delete('/delete/:id', deleteMess);
router.get('/rating/:id', getRating); // Add route for fetching rating
router.put('/rating/:id/:userId', updateRating); // Add route for updating rating with userId
module.exports = router;