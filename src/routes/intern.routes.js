import express from 'express';
import upload from '../middleware/upload.js';
import {
  createIntern,
  getAllInterns,
  updateIntern,
  deleteIntern,
  getUserAndIntern,
  getAllUserAndIntern,
  sendAcceptance,
  sendRejection,
  sendInternFormLink,
  getInternByUserId,
  getInternsByStatus
} from '../controller/intern.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import  verifyHrToken  from '../middleware/verifyHrToken.js';


const internRoutes = express.Router();
internRoutes.route("/get-all-users-and-intern").get(verifyToken, getAllUserAndIntern);
// POST /api/interns/ -- verifyToken + multer upload middleware + createIntern
internRoutes.route('/')
.post(
    verifyToken, 
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'signatureImage', maxCount: 1 }
    ]), 
    createIntern
)
.get(verifyToken, getAllInterns);


// only HR can call these routes
internRoutes.route("/send-fill-form").post(verifyHrToken, sendInternFormLink);
internRoutes.route("/send-acceptance").post(verifyHrToken, sendAcceptance);
internRoutes.route("/send-rejection").post(verifyHrToken, sendRejection);
internRoutes.route("/get-intern").get(verifyHrToken, getInternsByStatus);
internRoutes.route("/get-users-and-intern/:id").get(verifyHrToken, getUserAndIntern);

// --------

// Other routes with verifyToken
internRoutes.route('/:id')
  .get(verifyToken, getInternByUserId)
  .put( verifyToken, 
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'signatureImage', maxCount: 1 }
    ]), updateIntern)
  .delete(verifyToken, deleteIntern);

export default internRoutes;
