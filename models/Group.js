const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=900&auto=format&fit=crop&q=60',
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
