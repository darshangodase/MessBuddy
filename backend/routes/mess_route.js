const express = require('express');
const router = express.Router();
const { createMess, getAllMess, getMess, updateMess, deleteMess } = require('../controllers/mess_controller');

router.post('/create/:ownerId', createMess);
router.put('/update/:ownerId', updateMess);
router.get('/', getAllMess);
router.get('/:id', getMess);
router.delete('/delete/:id', deleteMess);
module.exports = router;