import Mentor from '../models/mentor.model.js';
import Intern from '../models/intern.model.js';
import User from '../models/user.model.js';

// Get all mentors
export const getAllMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find()
            .populate('userId', 'fullName email role')
            .populate({
                path: 'interns',
                populate: { path: 'userId', select: 'fullName email' }
            });

        res.status(200).json({ success: true, mentors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get mentor by ID
export const getMentorById = async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id)
            .populate('userId', 'fullName email role')
            .populate({
                path: 'interns',
                populate: { path: 'userId', select: 'fullName email' }
            });

        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        res.status(200).json({ success: true, mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a mentor profile (once role is set to MENTOR)
export const createMentor = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'MENTOR') {
            return res.status(400).json({ success: false, message: 'Invalid or unauthorized user for mentor profile' });
        }

        const mentorExists = await Mentor.findOne({ userId });
        if (mentorExists) {
            return res.status(400).json({ success: false, message: 'Mentor profile already exists' });
        }

        const newMentor = await Mentor.create({ userId });
        res.status(201).json({ success: true, mentor: newMentor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mentor updates status of assigned intern
export const updateInternStatusByMentor = async (req, res) => {
    const { mentorId } = req.user; // assumed to be extracted from verifyToken
    const { internId } = req.params;
    const { status } = req.body;

    const allowedStatus = ['waiting', 'new Joining', 'ongoing', 'completed', 'depart', 'certified'];

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    try {
        const intern = await Intern.findById(internId);
        if (!intern) {
            return res.status(404).json({ success: false, message: 'Intern not found' });
        }

        if (intern.mentorId.toString() !== mentorId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this intern' });
        }

        intern.status = status;
        await intern.save();

        res.status(200).json({ success: true, message: 'Intern status updated successfully', intern });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin/HR changes role of user to INTERN
export const changeUserRoleToIntern = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.role = 'INTERN';
        await user.save();

        res.status(200).json({ success: true, message: 'User role updated to INTERN', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
