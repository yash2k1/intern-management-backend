import express from 'express';
import {
    getAllMentors,
    getMentorById,
    createMentor,
    updateInternStatusByMentor,
    changeUserRoleToIntern
} from '../controller/mentor.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const mentorRoutes = express.Router();

mentorRoutes.route('/').get( verifyToken, getAllMentors);
mentorRoutes.route('/:id').get( verifyToken, getMentorById);
mentorRoutes.route('/').post( verifyToken, createMentor);
mentorRoutes.route('/intern/:internId/status').put( verifyToken, updateInternStatusByMentor);
mentorRoutes.route('/change-role/:userId').put( verifyToken, changeUserRoleToIntern);

export default mentorRoutes;
