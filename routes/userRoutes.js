const express = require('express');
const router = express.Router();
const { getUsers, updatePushToken } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.put('/push-token', protect, updatePushToken);

module.exports = router;
