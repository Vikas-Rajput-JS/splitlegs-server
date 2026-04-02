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
// @desc    Update user push token
// @route   PUT /api/users/push-token
// @access  Private
const updatePushToken = asyncHandler(async (req, res) => {
    const { pushToken } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        user.pushToken = pushToken;
        await user.save();
        res.json({ message: 'Push token updated' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { getUsers, updatePushToken };
