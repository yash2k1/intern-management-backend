import express from 'express';
import {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    getProjectsByDepartment
} from '../controller/departments.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const departmentRoutes = express.Router();

departmentRoutes.route('/')
    .post(verifyToken, createDepartment)
    .get(verifyToken, getAllDepartments);

departmentRoutes.route('/:id')
    .get(verifyToken, getDepartmentById)
    .put(verifyToken, updateDepartment)
    .delete(verifyToken, deleteDepartment);

// ✅ Get all projects for a specific department
departmentRoutes.route('/:id/projects')
    .get(verifyToken, getProjectsByDepartment);

export default departmentRoutes;
