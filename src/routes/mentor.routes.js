import express from "express";
import {
  getAllMentors,
  getMentorById,
  createMentor,
  updateInternStatusByMentor,
  removeReqInternFromMentor,
  getMentorInterns,
  suggestAnotherMentor,
  approveReqInterns,
  getAllRequestedInterns,
} from "../controller/mentor.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const mentorRoutes = express.Router();

mentorRoutes.get("/my-interns", verifyToken, getMentorInterns);
mentorRoutes
  .route("/intern/:internId/suggest-mentor")
  .put(verifyToken, suggestAnotherMentor);
mentorRoutes.route("/").get(verifyToken, getAllMentors);
mentorRoutes.route("/").post(verifyToken, createMentor);
mentorRoutes
  .route("/intern/:internId/status")
  .put(verifyToken, updateInternStatusByMentor);
mentorRoutes
  .route("/remove-intern/:internId")
  .put(verifyToken, removeReqInternFromMentor);
mentorRoutes.put(
  "/approve-requested-intern/:internId",
  verifyToken,
  approveReqInterns
);
mentorRoutes.get("/requested-interns", verifyToken, getAllRequestedInterns);
mentorRoutes.route("/:id").get(verifyToken, getMentorById);

export default mentorRoutes;
