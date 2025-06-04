import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember
} from "../controller/Project.controller.js";

import verifyToken from "../middleware/verifyToken.js";

const projectRoutes = express.Router();

// Create and get all projects
projectRoutes.route('/')
  .post(verifyToken, createProject)
  .get(verifyToken, getAllProjects);

// Get, update, and delete single project
projectRoutes.route('/:id')
  .get(verifyToken, getProjectById)
  .put(verifyToken, updateProject)
  .delete(verifyToken, deleteProject);

// Team management: add and remove members
projectRoutes.route('/:id/team')
  .post(verifyToken, addTeamMember)
  .delete(verifyToken, removeTeamMember);

export default projectRoutes;
