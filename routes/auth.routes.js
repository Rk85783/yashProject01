import { Router } from "express";
import { login, profile, register, verifyOtp } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middlwares.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.get("/profile", authenticate, profile);

authRouter.post("/verify-otp", authenticate, verifyOtp);

export default authRouter;