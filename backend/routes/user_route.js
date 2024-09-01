const express = require('express');
const router = express.Router();
const { test, updateUser,deleteuser,signout,getUser} = require('../controllers/user_controller');
const verifytoken = require('../utils/verifyuser');


router.put('/update/:userId', verifytoken, updateUser);
router.delete('/delete/:userId',verifytoken, deleteuser);
router.post('/signout', signout);
router.get('/:userId', getUser);


module.exports = router;
