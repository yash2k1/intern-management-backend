import Intern from '../models/Intern.models.js';
import User from '../models/user.models.js';
import Acadmics from '../models/acadmics.model.js';
import InternFormEmail from "../../utils/InternFormEmail.js";
import jwt from "jsonwebtoken";

//Create a new Intern with optional User update and academics link
export const createIntern = async (req, res) => {
    try {
        let {
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
            courseDuration,
            currentSemester,
            remark,
        } = req.body;

        // Trim strings if they are strings (to avoid error if undefined/null)
        const trimIfString = (val) => (typeof val === 'string' ? val.trim() : val);

        fullName = trimIfString(fullName);
        email = trimIfString(email);
        phoneNumber = trimIfString(phoneNumber);
        aadhaar = trimIfString(aadhaar);
        addressPresent = trimIfString(addressPresent);
        addressPermanent = trimIfString(addressPermanent);
        collegeName = trimIfString(collegeName);
        course = trimIfString(course);
        preference = trimIfString(preference);
        assignDepartment = trimIfString(assignDepartment);
        mentorId = trimIfString(mentorId);
        dob = trimIfString(dob);
        mobile = trimIfString(mobile);
        qualification = trimIfString(qualification);
        branch = trimIfString(branch);
        familyForeign = trimIfString(familyForeign);
        workedOrg = trimIfString(workedOrg);
        workedDRDO = trimIfString(workedDRDO);
        identificationMarks = trimIfString(identificationMarks);
        remark = trimIfString(remark);

        // Extract file paths from req.files and normalize them
        let profileImagePath = null;
        let signatureImagePath = null;

        const normalizePath = (filePath) =>
            filePath.replace(/^.*uploads[\\/]/, 'uploads/').replace(/\\/g, '/');

        if (req.files) {
            if (req.files['profileImage'] && req.files['profileImage'][0]) {
                profileImagePath = normalizePath(req.files['profileImage'][0].path);
            }
            if (req.files['signatureImage'] && req.files['signatureImage'][0]) {
                signatureImagePath = normalizePath(req.files['signatureImage'][0].path);
            }
        }

        // 1. Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2. Validate email and full name match (after trimming)
        if (user.email.trim() !== email || user.fullName.trim() !== fullName) {
            return res.status(400).json({
                success: false,
                message: 'Provided email or full name does not match with user record',
            });
        }

        // 3. Optionally update user fields
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (user.role !== 'INTERN') user.role = 'INTERN';
        await user.save();

        // 4. Create Intern with image paths
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
            profileImage: profileImagePath,
            signatureImage: signatureImagePath,
            remark,
        });

        // 5. Create Academics with semesterMarks initialized to 'PENDING'
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

        // 6. Link academics to intern
        intern.semId = acadmics._id;
        await intern.save();

        // 7. Respond with created data
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
// get All User And Intern
export const getAllUserAndIntern = async (req, res) => {
    try {
        const user = req.user; // Assume set by auth middleware

        // Allow only HR or MENTOR to access this route
        if (!user || !["HR", "MENTOR"].includes(user.role)) {
            return res.status(403).json({ message: "Access denied. Unauthorized role." });
        }

        const { role, name, page = 1, limit = 10 } = req.query;
        const filter = {};

        // Normalize and validate role
        const roleUpper = role?.toUpperCase();
        if (roleUpper && ["INTERN", "USER"].includes(roleUpper)) {
            filter.role = roleUpper;
        } else {
            // If no role provided or invalid, default to show only USER and INTERN
            filter.role = { $in: ["USER", "INTERN"] };
        }

        // Name filtering (case-insensitive, starts with)
        if (name) {
            filter.fullName = { $regex: `^${name}`, $options: "i" };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(filter)
            .select("-password")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limit);

        // Send response
        res.status(200).json({
            totalUsers,
            totalPages,
            currentPage: parseInt(page),
            users,
        });

    } catch (error) {
        console.error("Error in getAllUserAndIntern:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// get User And Intern whole detail

export const getUserAndIntern = async (req, res) => {
    try {
        const userId = req.params.id;

        // 1. Get user details
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // 2. Get intern profile if exists
        const intern = await Intern.findOne({ userId })
            .populate("assignDepartment", "departments")
            .populate("mentorId", "userId")
            .populate("semId");

        // 3. Extract academic details
        const acadmics = intern?.semId || null;

        // 4. Helper to build absolute URL from relative image path
        const getAbsoluteUrl = (relativePath) => {
            if (!relativePath) return null;
            const normalizedPath = relativePath.replace(/\\/g, "/"); // for Windows paths
            return `${req.protocol}://${req.get("host")}/${normalizedPath}`;
        };

        // 5. Convert intern image paths to absolute URLs
        let internWithAbsoluteImages = null;
        if (intern) {
            internWithAbsoluteImages = {
                ...intern._doc,
                profileImage: getAbsoluteUrl(intern.profileImage),
                signatureImage: getAbsoluteUrl(intern.signatureImage),
            };
        }

        // 6. Respond with full data
        res.status(200).json({
            success: true,
            data: {
                user,
                intern: internWithAbsoluteImages,
                acadmics,
            },
        });
    } catch (error) {
        console.error("Error in getUserAndIntern:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};


// ✅ 1. Send Fill Form Email
export const sendFillForm = async (req, res) => {
    try {
      console.log("chala kya")  
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // ✅ 1. Fetch user from DB
        const user = await User.findById(userId).select("email fullName");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const email = user.email;
        const userName = user.fullName;

        // ✅ 2. Generate JWT token with userId, email, userName
        const token = jwt.sign(
            { userId, email, userName },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        );

        // ✅ 3. Construct secure frontend form link
        const link = `${process.env.FRONTEND_URL}/add-new-intern?token=${token}`;

        // ✅ 4. Send email using utility
        await InternFormEmail(email, "INTERN_FORM", {
            subType: "FILL",
            internName: userName,
            link,
        });

        res.status(200).json({ message: "Fill form email sent successfully." });
    } catch (err) {
        console.error("Error sending fill form email:", err);
        res.status(500).json({ message: "Failed to send fill form email." });
    }
}


// ✅ 2. Send Update Form Email
export const sendUpdateForm = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // ✅ 1. Fetch user from DB
        const user = await User.findById(userId).select("email fullName");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const email = user.email;
        const userName = user.fullName;
        // ✅ 2. Generate JWT token with userId, email, userName
        const token = jwt.sign(
            { userId, email, userName },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        );

        // ✅ 3. Construct secure frontend form link
        const link = `${process.env.FRONTEND_URL}/add-new-intern/${token}`;

        await InternFormEmail(email, "INTERN_FORM", {
            subType: "UPDATE",
            internName: userName,
            link,
        });

        res.status(200).json({ message: "Update form email sent successfully." });
    } catch (err) {
        console.error("Error sending update form email:", err);
        res.status(500).json({ message: "Failed to send update form email." });
    }
}


// ✅ 3. Send Acceptance Email
export const sendAcceptance = async (req, res) => {
    try {
         const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // ✅ 1. Fetch user from DB
        const user = await User.findById(userId).select("email fullName");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const email = user.email;
        const userName = user.fullName;

        

        // ✅ 3. Construct secure frontend form link
        const link = `${process.env.FRONTEND_URL}/sign-in`;
        await InternFormEmail(email, "INTERN_FORM", {
            subType: "ACCEPTED",
            internName:userName,
            link,
        });

        res.status(200).json({ message: "Acceptance email sent successfully." });
    } catch (err) {
        console.error("Error sending acceptance email:", err);
        res.status(500).json({ message: "Failed to send acceptance email." });
    }
}

// ✅ 4. Send Rejection Email
export const sendRejection = async (req, res) => {
    try {
          const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // ✅ 1. Fetch user from DB
        const user = await User.findById(userId).select("email fullName");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const email = user.email;
        const userName = user.fullName;

      
        await InternFormEmail(email, "INTERN_FORM", {
            subType: "REJECTED",
            internName:userName,
        });

        res.status(200).json({ message: "Rejection email sent successfully." });
    } catch (err) {
        console.error("Error sending rejection email:", err);
        res.status(500).json({ message: "Failed to send rejection email." });
    }
}



