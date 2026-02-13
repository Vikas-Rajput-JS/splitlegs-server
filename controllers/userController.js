const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Search users by name or email
// @route   GET /api/users?search=
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.json(users);
});

module.exports = { getUsers };
