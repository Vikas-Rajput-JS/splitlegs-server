const express = require('express');
const router = express.Router();
const {
    createGroup,
    // getMyGroups,
    getGroupById,
    deleteGroup,
    getGroups,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createGroup)
    .get(protect, getGroups);

router.route('/:id')
    .get(protect, getGroupById)
    .delete(protect, deleteGroup);

module.exports = router;
