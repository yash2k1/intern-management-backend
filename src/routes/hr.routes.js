// routes/hr.routes.js
import express from "express";
import {
  assignMentorToIntern,
  updateUserStatus,
  assignRoleToUser
} from "../controller/hr.controller.js";

const hrRoutes = express.Router();

hrRoutes.put("/assign-mentor", assignMentorToIntern);
hrRoutes.put("/update-status", updateUserStatus);
hrRoutes.put("/assign-role", assignRoleToUser);

export default hrRoutes;
