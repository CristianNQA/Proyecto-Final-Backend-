import express from "express";
import { loginController, registerController, resendVerificationController, verifyEmailController } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/verify", verifyEmailController); 
authRoutes.post("/resend-verification", resendVerificationController);

export default authRoutes;

