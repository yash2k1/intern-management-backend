import express from 'express';
import upload from '../middleware/upload.js';
import {
  createIntern,
  getAllInterns,
  getInternById,
  updateIntern,
  deleteIntern,
  getUserAndIntern,
  getAllUserAndIntern,
  sendFillForm,
  sendUpdateForm,
  sendAcceptance,
  sendRejection
} from '../controller/intern.controller.js';
import verifyToken from '../middleware/verifyToken.js';

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



internRoutes.route("/send-fill-form").post(verifyToken, sendFillForm);
internRoutes.route("/send-update-form").post(verifyToken, sendUpdateForm);
internRoutes.route("/send-acceptance").post(verifyToken, sendAcceptance);
internRoutes.route("/send-rejection").post(verifyToken, sendRejection);
internRoutes.route("/get-users-and-intern/:id").get(verifyToken, getUserAndIntern);
// Other routes with verifyToken
internRoutes.route('/:id')
  .get(verifyToken, getInternById)
  .put(verifyToken, updateIntern)
  .delete(verifyToken, deleteIntern);

export default internRoutes;
