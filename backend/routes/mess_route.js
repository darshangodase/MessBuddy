const express = require('express');
const router = express.Router();
const { createMess, getAllMess, getMess, updateMess, deleteMess ,readMess,getRating,updateRating} = require('../controllers/mess_controller');

router.post('/create/:ownerId', createMess);
router.put('/update/:ownerId', updateMess);
router.get('/', getAllMess);
router.get('/:id', getMess);
router.get('/read/:id', readMess);
router.delete('/delete/:id', deleteMess);
router.get('/rating/:id', getRating); 
router.put('/rating/:id/:userId', updateRating); 
module.exports = router;