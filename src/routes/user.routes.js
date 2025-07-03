import express from "express";

import {
  changePassword,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUser,
  resetPassword,
  sendVerificationEmail,
  signin,
  signout,
  signup,
  updateUser,
  verifyEmail,
} from "../controller/user.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const userRoutes = express.Router();

userRoutes.route("/signup").post(signup);
userRoutes.route("/signin").post(signin);
userRoutes.route("/signout").post(verifyToken, signout);
userRoutes.route("/send-verification-email").post(sendVerificationEmail);
userRoutes.route("/verify-email").post(verifyEmail);
userRoutes.route("/forgot-password").post(forgotPassword);
userRoutes.route("/reset-password/:token").put(resetPassword);
userRoutes.route("/change-password").put(verifyToken, changePassword);
userRoutes.route("/get-all-users").get(verifyToken, getAllUsers);


userRoutes
  .route("/:id")
  .get(verifyToken, getUser)
  .put(verifyToken, updateUser)
  .delete(verifyToken, deleteUser);


export default userRoutes;
