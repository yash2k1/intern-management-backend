// routes/hr.routes.js
import express from "express";
import {
  assignMentorToIntern,
  updateUserStatus,
  assignRoleToUser,
  changeUserRoleToIntern
} from "../controller/hr.controller.js";
import verifyHrToken from "../middleware/verifyHrToken.js";

const hrRoutes = express.Router();

hrRoutes.put("/assign-mentor", assignMentorToIntern);
hrRoutes.put("/update-status", updateUserStatus);
hrRoutes.put("/assign-role", assignRoleToUser);
hrRoutes.route('/change-role/:userId').put( verifyHrToken, changeUserRoleToIntern);
export default hrRoutes;
