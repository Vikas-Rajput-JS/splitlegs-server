const Group = require('../models/Group');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = asyncHandler(async (req, res) => {
    const { name, image } = req.body;

    // Invitation code generation (6 chars alphanumeric)
    const generateInviteCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    let inviteCode = generateInviteCode();
    
    // Check for collisions (very unlikely with 36^6 but good practice)
    let exists = await Group.findOne({ inviteCode });
    while (exists) {
        inviteCode = generateInviteCode();
        exists = await Group.findOne({ inviteCode });
    }

    const group = await Group.create({
        name,
        image,
        members: [req.user._id],
        createdBy: req.user._id,
        inviteCode
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

    // De-duplicate members if database has duplicates
    const sanitizedGroups = groups.map(g => {
        const groupObj = g.toObject();
        const seen = new Set();
        groupObj.members = (groupObj.members || []).filter(m => {
            const id = m._id?.toString() || m.toString();
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
        return groupObj;
    });

    res.json(sanitizedGroups);
});

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id).populate('members', 'name email avatar');

    if (group) {
        const groupObj = group.toObject();
        const seen = new Set();
        groupObj.members = (groupObj.members || []).filter(m => {
            const id = m._id?.toString() || m.toString();
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        if (groupObj.members.some(m => (m._id?.toString() || m.toString()) === req.user._id.toString())) {
            res.json(groupObj);
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

// @desc    Join a group via invite code
// @route   POST /api/groups/join/:inviteCode
// @access  Private
const joinGroupByInvite = asyncHandler(async (req, res) => {
    const { inviteCode } = req.params;
    const group = await Group.findOne({ inviteCode });

    if (!group) {
        res.status(404);
        throw new Error('Invalid invitation code');
    }

    if (group.members.includes(req.user._id)) {
        res.status(400);
        throw new Error('You are already a member of this group');
    }

    group.members.push(req.user._id);
    await group.save();

    res.json({ message: 'Joined group successfully', group });
});

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    deleteGroup,
    joinGroupByInvite
};
