const express = require('express');
const router = express.Router();
const {signout} = require('../controllers/user_controller');
const { deleteUserAccount } = require('../controllers/user_controller');

router.post('/signout', signout);
router.delete('/delete-account/:userId', deleteUserAccount);
module.exports = router;
