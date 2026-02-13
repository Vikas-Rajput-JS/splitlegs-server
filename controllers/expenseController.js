const Expense = require('../models/Expense');
const Group = require('../models/Group');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Add an expense to a group
// @route   POST /api/expenses
// @access  Private
const addExpense = asyncHandler(async (req, res) => {
    const { description, amount, groupId, participants, category, date } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    // Default split if participants not provided (split equally among all members)
    let finalParticipants = participants;
    if (!participants || participants.length === 0) {
        const splitAmount = amount / group.members.length;
        finalParticipants = group.members.map(memberId => ({
            user: memberId,
            amount: splitAmount
        }));
    }

    const expense = await Expense.create({
        description,
        amount,
        paidBy: req.user._id,
        groupId,
        participants: finalParticipants,
        category,
        date: date || Date.now(),
    });

    if (expense) {
        res.status(201).json(expense);
    } else {
        res.status(400);
        throw new Error('Invalid expense data');
    }
});

// @desc    Get all expenses for the logged in user
// @route   GET /api/expenses
// @access  Private
const getMyExpenses = asyncHandler(async (req, res) => {
    const groups = await Group.find({ members: req.user._id });
    const groupIds = groups.map(g => g._id);

    const expenses = await Expense.find({ groupId: { $in: groupIds } })
        .populate('paidBy', 'name avatar')
        .populate('groupId', 'name')
        .sort('-date')
        .limit(10);

    res.json(expenses);
});

// @desc    Get expenses for a group
// @route   GET /api/expenses/group/:groupId
// @access  Private
const getGroupExpenses = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (!group.members.includes(req.user._id)) {
        res.status(401);
        throw new Error('Not authorized to view these expenses');
    }

    const expenses = await Expense.find({ groupId: req.params.groupId })
        .populate('paidBy', 'name avatar')
        .sort('-date');

    res.json(expenses);
});

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
        if (expense.paidBy.toString() === req.user._id.toString()) {
            await expense.deleteOne();
            res.json({ message: 'Expense removed' });
        } else {
            res.status(401);
            throw new Error('Only the person who paid can delete the expense');
        }
    } else {
        res.status(404);
        throw new Error('Expense not found');
    }
});

module.exports = {
    addExpense,
    getMyExpenses,
    getGroupExpenses,
    deleteExpense,
};
