import Departments from "../models/departments.models.js";

// Create new department
export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name is required.",
      });
    }

    // Check if department already exists (case-insensitive)
    const existing = await Departments.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Department already exists.",
      });
    }

    const department = await Departments.create({ name: name.trim() });
    res.status(201).json({
      success: true,
      message: "Department created",
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// Get single department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Departments.findById(req.params.id).populate(
      "projects"
    );
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    res.status(200).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const { name = "", page = 1, limit = 10 } = req.query;

    const filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // case-insensitive contains
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const departments = await Departments.find(filter)
      .sort({ name: 1 }) // alphabetical order
      .skip(skip)
      .limit(parseInt(limit));

    const totalDepartments = await Departments.countDocuments(filter);
    const totalPages = Math.ceil(totalDepartments / limit);

    res.status(200).json({
      success: true,
      departments,
      totalDepartments,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch departments.",
    });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const department = await Departments.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Department updated", department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Departments.findByIdAndDelete(req.params.id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    res.status(200).json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all projects for a specific department

export const getProjectsByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Find department by ID to get its name
    const department = await Departments.findById(departmentId);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // Find projects where department matches the name in departments.departments
    const projects = await Project.find({
      department: department.departments,
    }).populate({
      path: "mentorId interns",
      select: "userId fullName email",
    });

    res.status(200).json({
      success: true,
      message: `Projects for department ${department.departments}`,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
