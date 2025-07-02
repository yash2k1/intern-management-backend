import User from "../models/user.models.js"; // unified user model

export const assignMentorToIntern = async (req, res) => {
  try {
    const { internId, mentorId } = req.body;

    if (!internId || !mentorId) {
      return res.status(400).json({ message: "internId and mentorId are required" });
    }

    const intern = await User.findOne({ _id: internId, role: "INTERN" });
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    const mentor = await User.findOne({ _id: mentorId, role: "MENTOR" });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Assign mentor to intern
    intern.mentorId = mentorId;
    await intern.save();

    res.status(200).json({
      message: "Mentor assigned to intern successfully",
      internId,
      mentorId
    });
  } catch (error) {
    console.error("Error assigning mentor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userIdToUpdate, status } = req.body;

    if (!userIdToUpdate || !status) {
      return res.status(400).json({ message: "userIdToUpdate and status are required" });
    }

    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      message: "User status updated successfully",
      userId: user._id,
      newStatus: user.status,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required" });
    }

    const allowedRoles = ["INTERN", "MENTOR", "HR", "ADMIN"];
    if (!allowedRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role.toUpperCase();
    await user.save();

    res.status(200).json({
      message: "Role assigned successfully",
      userId: user._id,
      newRole: user.role,
    });
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
