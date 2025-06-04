import Project from '../models/project.models.js';


// Create a new project
export const createProject = async (req, res) => {
    try {
        const { mentorId, department, title, description, projectProposal, interns, startDate, endDate } = req.body;

        const project = await Project.create({
            mentorId,
            department,
            title,
            description,
            projectProposal,
            interns,
            startDate,
            endDate,
            team: [{ userId: mentorId, designation: 'Project Mentor', authority: 'ADMIN' }]
        });

        res.status(201).json({ success: true, message: 'Project created successfully', project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all projects
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 })
            .populate('mentorId', 'userId fullName email')
            .populate('interns', 'userId fullName email')
            .populate('team.userId', 'fullName email');

        res.status(200).json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single project by ID
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('mentorId', 'userId fullName email')
            .populate('interns', 'userId fullName email')
            .populate('team.userId', 'fullName email');

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a project
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        const isMentor = project.mentorId.toString() === req.user.id;
        const isAdmin = project.team.some(
            member => member.userId.toString() === req.user.id && member.authority === 'ADMIN'
        );

        if (!isMentor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only project mentor or ADMIN can update project'
            });
        }

        // Update allowed
        Object.assign(project, req.body); // merges updated fields
        await project.save();

        res.status(200).json({ success: true, message: 'Project updated', project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Delete a project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMentor = project.mentorId.toString() === req.user.id;

    if (!isMentor) {
      return res.status(403).json({ success: false, message: 'Only the mentor can delete the project' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Add a team member (only by mentor)
export const addTeamMember = async (req, res) => {
    try {
        const { userId, designation } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        const mentorTeamMember = project.team.find(member => member.userId.toString() === req.user.id && member.authority === 'ADMIN');

        if (!mentorTeamMember) {
            return res.status(403).json({ success: false, message: 'Only users with ADMIN authority can add team members' });
        }

        const exists = project.team.some(member => member.userId.toString() === userId);
        if (exists) {
            return res.status(400).json({ success: false, message: 'Team member already exists' });
        }

        project.team.push({ userId, designation, authority: 'MEMBER' });
        await project.save();

        res.status(200).json({ success: true, message: 'Team member added', project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove a team member (only by ADMIN authority)
export const removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isAdmin = project.team.find(member => member.userId.toString() === req.user.id && member.authority === 'ADMIN');
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only users with ADMIN authority can remove team members' });
    }

    if (userId === project.mentorId.toString()) {
      return res.status(403).json({ success: false, message: 'Mentor cannot be removed from the team' });
    }

    const existingMember = project.team.find(member => member.userId.toString() === userId);
    if (!existingMember) {
      return res.status(400).json({ success: false, message: 'Team member not found' });
    }

    project.team = project.team.filter(member => member.userId.toString() !== userId);
    await project.save();

    res.status(200).json({ success: true, message: 'Team member removed', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
