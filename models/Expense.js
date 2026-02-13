const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Group',
        },
        participants: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                amount: {
                    type: Number,
                    required: true,
                },
            },
        ],
        category: {
            type: String,
            default: 'General',
        },
        date: {
            type: Date,
            default: Date.now,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
