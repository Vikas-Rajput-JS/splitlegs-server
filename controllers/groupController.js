const Group = require('../models/Group');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = asyncHandler(async (req, res) => {
    const { name, image, members } = req.body;

    // Ensure the creator is included in members
    const groupMembers = members ? [...new Set([...members, req.user._id])] : [req.user._id];

    const group = await Group.create({
        name,
        image,
        members: groupMembers,
        createdBy: req.user._id,
    });

    if (group) {
        res.status(201).json(group);
    } else {
        res.status(400);
        throw new Error('Invalid group data');
    }
});

// @desc    Get all groups for a user
// @route   GET /api/groups
// @access  Private
const getGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find({ members: req.user._id }).populate('members', 'name email avatar');
    res.json(groups);
});

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id).populate('members', 'name email avatar');

    if (group) {
        if (group.members.some(m => m._id.toString() === req.user._id.toString())) {
            res.json(group);
        } else {
            res.status(401);
            throw new Error('Not authorized to view this group');
        }
    } else {
        res.status(404);
        throw new Error('Group not found');
    }
});

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);

    if (group) {
        if (group.createdBy.toString() === req.user._id.toString()) {
            await group.deleteOne();
            res.json({ message: 'Group removed' });
        } else {
            res.status(401);
            throw new Error('Only the creator can delete the group');
        }
    } else {
        res.status(404);
        throw new Error('Group not found');
    }
});

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    deleteGroup,
};
