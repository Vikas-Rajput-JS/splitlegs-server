const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroupById,
    deleteGroup,
    getGroups,
    joinGroupByInvite,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createGroup)
    .get(protect, getGroups);

router.route('/:id')
    .get(protect, getGroupById)
    .delete(protect, deleteGroup);

router.post('/join/:inviteCode', protect, joinGroupByInvite);

module.exports = router;
