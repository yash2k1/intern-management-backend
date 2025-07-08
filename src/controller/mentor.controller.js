import Mentor from "../models/mentor.models.js";
import Intern from "../models/Intern.models.js";
import User from "../models/user.models.js";

// Get all mentors
export const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find()
      .populate("userId", "fullName email role")
      .populate({
        path: "interns",
        populate: {
          path: "userId",
          select: "fullName email",
        },
      });

    res.status(200).json({ success: true, mentors });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get mentor by ID
export const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate("userId", "fullName email role")
      .populate({
        path: "interns",
        populate: { path: "userId", select: "fullName email" },
      });

    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
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
    if (!user || user.role !== "MENTOR") {
      return res.status(400).json({
        success: false,
        message: "Invalid or unauthorized user for mentor profile",
      });
    }

    const mentorExists = await Mentor.findOne({ userId });
    if (mentorExists) {
      return res
        .status(400)
        .json({ success: false, message: "Mentor profile already exists" });
    }

    const newMentor = await Mentor.create({ userId });
    res.status(201).json({ success: true, mentor: newMentor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mentor updates status of assigned intern
export const updateInternStatusByMentor = async (req, res) => {
  const { userId } = req.user; // ✅ userId is always in token
  const { internId } = req.params;
  const { status } = req.body;
  const allowedStatus = [
    "WAITING",
    "NEW JOINING",
    "ONGOING",
    "COMPLETED",
    "DEPART",
    "CERTIFIED",
  ];

  if (!allowedStatus.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }

  try {
    const mentor = await Mentor.findOne({ userId }); // ✅ get mentor by userId

    if (!mentor) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized: Mentor not found" });
    }

    const intern = await Intern.findById(internId);
    if (!intern) {
      return res
        .status(404)
        .json({ success: false, message: "Intern not found" });
    }

    if (
      !intern.mentorId ||
      intern.mentorId.toString() !== mentor._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this intern",
      });
    }

    intern.status = status;
    await intern.save();

    return res.status(200).json({
      success: true,
      message: "Intern status updated successfully",
      intern,
    });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const removeInternFromMentor = async (req, res) => {
  const { internId } = req.params;

  try {
    // Find the intern first
    const intern = await Intern.findById(internId);
    if (!intern) {
      return res.status(404).json({ success: false, message: "Intern not found" });
    }

    const mentorId = intern.mentorId;
    if (!mentorId) {
      return res.status(400).json({ success: false, message: "Intern does not have a mentor assigned" });
    }

    // Remove intern from mentor's interns list
    const mentor = await Mentor.findByIdAndUpdate(
      mentorId,
      { $pull: { interns: internId } },
      { new: true }
    );

    // Also set intern.mentorId = null and status = "WAITING"
    intern.mentorId = null;
    intern.status = "WAITING";
    await intern.save();

    return res.status(200).json({
      success: true,
      message: "Intern removed from mentor and status set to WAITING",
      updatedMentor: mentor,
      updatedIntern: intern,
    });
  } catch (error) {
    console.error("❌ Error removing intern from mentor:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getMentorInterns = async (req, res) => {
  try {
    console.log("---------inside api ------------");
    const { userId } = req.user;

    // Find mentor using userId
    const mentor = await Mentor.findOne({ userId })
  .populate({
    path: 'interns',
    populate: [
      { path: 'userId', model: 'User' },
      { path: 'assignDepartment', model: 'Department' } // or whatever your model is named
    ]
});

    res.status(200).json({ success: true, interns: mentor.interns });
  } catch (error) {
    console.error("Error fetching mentor's interns:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const suggestAnotherMentor = async (req, res) => {
  try {
    const { internId } = req.params;
    const { suggestedMentorId } = req.body;
    const { userId } = req.user;

    // Find current mentor using userId
    const currentMentor = await Mentor.findOne({ userId });
    if (!currentMentor) {
      return res.status(403).json({ success: false, message: "Mentor not found" });
    }

    // Find intern
    const intern = await Intern.findById(internId);
    if (!intern) {
      return res.status(404).json({ success: false, message: "Intern not found" });
    }

    // Optional: Ensure that the intern is actually assigned to this mentor
    if (intern.mentorId?.toString() !== currentMentor._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this intern" });
    }

    // Update suggested mentor
    intern.suggestedMentor = suggestedMentorId;
    await intern.save();

    res.status(200).json({ success: true, message: "Mentor suggestion updated", intern });
  } catch (error) {
    console.error("Error suggesting mentor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

