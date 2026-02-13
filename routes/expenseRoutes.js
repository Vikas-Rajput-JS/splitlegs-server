const express = require('express');
const router = express.Router();
const {
    addExpense,
    getMyExpenses,
    getGroupExpenses,
    deleteExpense,
    settleExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMyExpenses)
    .post(protect, addExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.delete('/:id', protect, deleteExpense);
router.put('/:id/settle', protect, settleExpense);

module.exports = router;
