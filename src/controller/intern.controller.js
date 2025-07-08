import Intern from "../models/Intern.models.js";
import User from "../models/user.models.js";
import Acadmics from "../models/acadmics.model.js";
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
      aadhar,
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
    const trimIfString = (val) => (typeof val === "string" ? val.trim() : val);

    fullName = trimIfString(fullName);
    email = trimIfString(email);
    phoneNumber = trimIfString(phoneNumber);
    aadhar = trimIfString(aadhar);
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
      filePath.replace(/^.*uploads[\\/]/, "uploads/").replace(/\\/g, "/");

    if (req.files) {
      if (req.files["profileImage"] && req.files["profileImage"][0]) {
        profileImagePath = normalizePath(req.files["profileImage"][0].path);
      }
      if (req.files["signatureImage"] && req.files["signatureImage"][0]) {
        signatureImagePath = normalizePath(req.files["signatureImage"][0].path);
      }
    }

    // 1. Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Validate email match (after trimming)
    if (user.email.trim() !== email) {
      return res.status(400).json({
        success: false,
        message: "Provided email does not match with user record",
      });
    }

    // 3. Optionally update user fields
    if (fullName) user.fullName = fullName;
    if (user.role !== "INTERN") user.role = "INTERN";
    await user.save();

    // 4. Create Intern with image paths
    const intern = await Intern.create({
      userId,
      phoneNumber,
      aadhar,
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
      semesterMarks.set(`Semester ${i}`, "PENDING");
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
      message: "Intern, user, and academic details handled successfully.",
      intern,
      acadmics,
      user,
    });
  } catch (error) {
    console.error("[CREATE INTERN ERROR]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get all interns
export const getAllInterns = async (req, res) => {
  try {
    const interns = await Intern.find()
      .select("remark")
      .populate("userId", "fullName email")
      .populate("assignDepartment", "departments")
      .populate("mentorId", "userId") // optional: also deeply populate mentorId.userId if needed
      .populate("suggestedMentor", "userId")
      .populate({
        path: "suggestedMentor",
        populate: {
          path: "userId",
          model: "User",
          select: "fullName email",
        },
      });

    res.status(200).json({ success: true, interns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get intern by user ID
export const getInternByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    const intern = await Intern.findOne({ userId })
      .populate("userId", "fullName email status")
      .populate("assignDepartment", "departments")
      .populate("mentorId", "userId")
      .populate("semId");

    if (!intern) {
      return res
        .status(404)
        .json({ success: false, message: "Intern not found" });
    }

    res.status(200).json({ success: true, intern });
  } catch (err) {
    console.error("[GET INTERN BY USER ID ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
//Update intern by user id
export const updateIntern = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const intern = await Intern.findOne({ userId });
    if (!intern) {
      return res
        .status(404)
        .json({ success: false, message: "Intern not found for this user" });
    }

    if (req.body.email && req.body.email.trim() !== user.email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Provided email does not match user record",
      });
    }

    if (req.body.fullName) user.fullName = req.body.fullName.trim();
    if (user.role !== "INTERN") user.role = "INTERN";
    await user.save();

    const normalizePath = (filePath) =>
      filePath.replace(/^.*uploads[\\/]/, "uploads/").replace(/\\/g, "/");

    if (req.files) {
      if (req.files["profileImage"] && req.files["profileImage"][0]) {
        intern.profileImage = normalizePath(req.files["profileImage"][0].path);
      }
      if (req.files["signatureImage"] && req.files["signatureImage"][0]) {
        intern.signatureImage = normalizePath(
          req.files["signatureImage"][0].path
        );
      }
    }

    const {
      phoneNumber,
      aadhar,
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
      remark,
      courseDuration,
      currentSemester,
      semesterMarks,
    } = req.body;

    const fieldsToUpdate = {
      phoneNumber,
      aadhar,
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
      remark,
    };

    for (const key in fieldsToUpdate) {
      if (fieldsToUpdate[key] !== undefined) {
        intern[key] =
          typeof fieldsToUpdate[key] === "string"
            ? fieldsToUpdate[key].trim()
            : fieldsToUpdate[key];
      }
    }

    await intern.save();

    let acadmics = null;

    if (
      courseDuration !== undefined ||
      currentSemester !== undefined ||
      semesterMarks !== undefined
    ) {
      acadmics = await Acadmics.findById(intern.semId);
      if (acadmics) {
        if (courseDuration !== undefined)
          acadmics.courseDuration = courseDuration;
        if (currentSemester !== undefined)
          acadmics.currentSemester = currentSemester;

        if (semesterMarks) {
          try {
            const parsedMarks =
              typeof semesterMarks === "string"
                ? JSON.parse(semesterMarks)
                : semesterMarks;
            acadmics.semesterMarks = parsedMarks;
          } catch (e) {
            console.error("Failed to parse semesterMarks:", e);
          }
        }

        await acadmics.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Intern details updated successfully",
      intern,
      user,
      acadmics,
    });
  } catch (error) {
    console.error("[UPDATE INTERN ERROR]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Delete intern and linked academic record
export const deleteIntern = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) {
      return res
        .status(404)
        .json({ success: false, message: "Intern not found" });
    }

    // Delete linked academics
    await Acadmics.findByIdAndDelete(intern.semId);

    // Delete intern
    await intern.deleteOne();

    res.status(200).json({
      success: true,
      message: "Intern and academics deleted successfully.",
    });
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
      return res
        .status(403)
        .json({ message: "Access denied. Unauthorized role." });
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
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // 2. Get intern profile if exists
    const intern = await Intern.findOne({ userId, statusCode: "WAITING" })
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

// ✅ 1. Send Fill Form Email && Send Update Form Email

export const sendInternFormLink = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // ✅ 1. Fetch user
    const user = await User.findById(userId).select("email fullName");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { email, fullName: userName } = user;

    // ✅ 2. Check if intern already exists
    const existingIntern = await Intern.findOne({ userId });

    const subType = existingIntern ? "UPDATE" : "FILL";

    // ✅ 3. Generate JWT token
    const token = jwt.sign(
      { userId, email, userName },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
      // { expiresIn: "30m" }
    );

    // ✅ 4. Create secure frontend link (query param version)
    const link = `${process.env.FRONTEND_URL}/${existingIntern ? `update-new-intern?token=${token}` : `add-new-intern?token=${token}`}`;

    // ✅ 5. Send email
    await InternFormEmail(email, "INTERN_FORM", {
      subType,
      internName: userName,
      link,
    });

    return res.status(200).json({
      message: `${subType === "FILL" ? "Fill" : "Update"} form email sent successfully.`,
    });
  } catch (err) {
    console.error("Error sending intern form email:", err);
    return res
      .status(500)
      .json({ message: "Failed to send intern form email." });
  }
};

// ✅ 3. Send Acceptance Email
export const sendAcceptance = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user to get email and name
    const user = await User.findById(userId).select("email fullName");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update intern status to "NEW JOINING"
    const intern = await Intern.findOneAndUpdate(
      { userId },
      { status: "NEW JOINING" },
      { new: true }
    );
    if (!intern) {
      return res.status(404).json({ message: "Intern record not found" });
    }

    // Prepare email link (change FRONTEND_URL to your actual env var)
    const link = `${process.env.FRONTEND_URL}/sign-in`;

    // Send acceptance email
    await InternFormEmail(user.email, "INTERN_FORM", {
      subType: "ACCEPTED",
      internName: user.fullName,
      link,
    });

    return res.status(200).json({
      message: "Acceptance email sent and status updated successfully",
      intern,
    });
  } catch (error) {
    console.error("sendAcceptance error:", error);
    return res.status(500).json({ message: "Failed to send acceptance email" });
  }
};
// ✅ 4. Send Rejection Email
export const sendRejection = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId).select("email fullName");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the intern linked to the user
    const intern = await Intern.findOne({ userId });
    if (intern) {
      // Delete related academics if any
      if (intern.semId) {
        await Acadmics.findByIdAndDelete(intern.semId);
      }
      // Delete intern document
      await Intern.deleteOne({ _id: intern._id });
    }

    // Delete the user
    await User.deleteOne({ _id: userId });

    // Send rejection email
    await InternFormEmail(user.email, "INTERN_FORM", {
      subType: "REJECTED",
      internName: user.fullName,
    });

    res
      .status(200)
      .json({ message: "User deleted and rejection email sent successfully." });
  } catch (err) {
    console.error("Error in sendRejection:", err);
    res.status(500).json({ message: "Failed to process rejection." });
  }
};
