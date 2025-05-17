import { Router } from "express";
import { changePassword, forgotPassword, login, profile, register, resetPassword, verifyOtp } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middlwares.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

authRouter.get("/profile", authenticate, profile);

authRouter.post("/verify-otp", authenticate, verifyOtp);
authRouter.post("/change-email", authenticate, verifyOtp);
authRouter.post("/change-password", authenticate, changePassword);

export default authRouter;