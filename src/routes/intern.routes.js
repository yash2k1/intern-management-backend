import express from 'express';
import {
    createIntern,
    getAllInterns,
    getInternById,
    updateIntern,
    deleteIntern
} from '../controller/intern.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const internRoutes = express.Router();

internRoutes.route('/').post(verifyToken, createIntern);
internRoutes.route('/').get(verifyToken, getAllInterns);
internRoutes.route('/:id')
    .get(verifyToken, getInternById)
    .put(verifyToken, updateIntern)
    .delete(verifyToken, deleteIntern);

export default internRoutes;
