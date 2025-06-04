import Intern from '../models/Intern.models.js';
import User from '../models/user.models.js';
import Acadmics from '../models/acadmics.model.js';


//Create a new Intern with optional User update and academics link
export const createIntern = async (req, res) => {
    try {
        const {
            userId,
            fullName,
            email,
            phoneNumber,
            aadhaar,
            addressPresent,
            addressPermanent,
            collegeName,
            course,
            preference,
            assignDepartment,
            mentorId,
            internshipDuration,
            dob,
            age,
            mobile,
            qualification,
            branch,
            familyForeign,
            workedOrg,
            workedDRDO,
            identificationMarks,
            profileImage,
            signatureImage,
            courseDuration,
            currentSemester,
        } = req.body;

        // 1. Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2. Optionally update user fields if provided
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (user.role !== 'INTERN') user.role = 'INTERN';
        await user.save();

        // 3. Create Intern
        const intern = await Intern.create({
            userId,
            phoneNumber,
            aadhaar,
            addressPresent,
            addressPermanent,
            collegeName,
            course,
            preference,
            assignDepartment,
            mentorId,
            internshipDuration,
            dob,
            age,
            mobile,
            qualification,
            branch,
            familyForeign,
            workedOrg,
            workedDRDO,
            identificationMarks,
            profileImage,
            signatureImage,
            remark,
        });

        // 4. Create Academics with semesterMarks initialized to 'PENDING'
        const semesterMarks = new Map();
        for (let i = 1; i <= courseDuration * 2; i++) {
            semesterMarks.set(`Semester ${i}`, 'PENDING');
        }

        const acadmics = await Acadmics.create({
            internId: intern._id,
            courseDuration,
            currentSemester,
            semesterMarks,
        });

        // 5. Link academics to intern
        intern.semId = acadmics._id;
        await intern.save();

        // 6. Respond with created data
        res.status(201).json({
            success: true,
            message: 'Intern, user, and academic details handled successfully.',
            intern,
            acadmics,
            user,
        });
    } catch (error) {
        console.error('[CREATE INTERN ERROR]', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//Get all interns
export const getAllInterns = async (req, res) => {
    try {
        const interns = await Intern.find()
            .select('remark')
            .populate('userId', 'fullName email')
            .populate('assignDepartment', 'departments')
            .populate('mentorId', 'userId')
        // .populate('semId');

        res.status(200).json({ success: true, interns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Get intern by ID
export const getInternById = async (req, res) => {
    try {
        const intern = await Intern.findById(req.params.id)
            .select('remark')
            .populate('userId', 'fullName email status')
            .populate('assignDepartment', 'departments')
            .populate('mentorId', 'userId')
            .populate('semId');

        if (!intern) {
            return res.status(404).json({ success: false, message: 'Intern not found' });
        }

        res.status(200).json({ success: true, intern });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Update intern and optionally user
export const updateIntern = async (req, res) => {
    try {
        const intern = await Intern.findById(req.params.id);
        if (!intern) {
            return res.status(404).json({ success: false, message: 'Intern not found' });
        }

        // Update intern fields
        Object.assign(intern, req.body);
        await intern.save();

        // Optionally update user fields
        const { fullName, email } = req.body;
        if (fullName || email) {
            const user = await User.findById(intern.userId);
            if (user) {
                if (fullName) user.fullName = fullName;
                if (email) user.email = email;
                await user.save();
            }
        }

        res.status(200).json({ success: true, message: 'Intern and user updated successfully.', intern });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//Delete intern and linked academic record
export const deleteIntern = async (req, res) => {
    try {
        const intern = await Intern.findById(req.params.id);
        if (!intern) {
            return res.status(404).json({ success: false, message: 'Intern not found' });
        }

        // Delete linked academics
        await Acadmics.findByIdAndDelete(intern.semId);

        // Delete intern
        await intern.deleteOne();

        res.status(200).json({ success: true, message: 'Intern and academics deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
