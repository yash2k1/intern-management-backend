import User from "../models/user.models.js"; // unified user model
import Mentor from "../models/mentor.models.js";
import Intern from "../models/Intern.models.js";

export const assignMentorToIntern = async (req, res) => {
  try {
    const { internId, mentorId } = req.body;

    if (!internId || !mentorId) {
      return res
        .status(400)
        .json({ message: "internId and mentorId are required" });
    }

    const intern = await Intern.findById(internId);
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Avoid duplicate entries in Requestedinterns
    if (!mentor.Requestedinterns.includes(internId)) {
      mentor.Requestedinterns.push(internId);
      await mentor.save();
    }

    // Store mentorId and update intern status
    intern.mentorId = mentorId;
    intern.status = "NEW JOINING"; // ✅ Set status here
    await intern.save();

    res.status(200).json({
      message: "Mentor assigned to intern successfully",
      internId,
      mentorId,
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
      return res
        .status(400)
        .json({ message: "userIdToUpdate and status are required" });
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
    const newRole = role.toUpperCase();

    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousRole = user.role;
    user.role = newRole;
    await user.save();

    // ✅ If new role is MENTOR, add to Mentor collection if not present
    if (newRole === "MENTOR") {
      const existingMentor = await Mentor.findOne({ userId: user._id });

      if (!existingMentor) {
        await Mentor.create({
          userId: user._id,
          interns: [],
        });
      }
    }

    // ✅ If previous role was MENTOR and new role is NOT MENTOR, remove from Mentor collection
    if (previousRole === "MENTOR" && newRole !== "MENTOR") {
      await Mentor.deleteOne({ userId: user._id });
    }

    res.status(200).json({
      message: `Role changed from ${previousRole} to ${newRole}`,
      userId: user._id,
      newRole: user.role,
    });
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// HR changes role of user to INTERN
export const changeUserRoleToIntern = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.role = "INTERN";
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User role updated to INTERN", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
