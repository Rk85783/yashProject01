import { createUser, findUser } from "../services/auth.service.js";
import { hashedPassword } from "../services/bcrypt.service.js";
import { sendMail } from "../services/email.service.js";
import { generateAccessToken } from "../services/jwt.service.js";
import { generateOtp } from "../utils/helper.js";
import { loginSchema, registerSchema, verifyOtpSchema } from "../utils/validators.js";

export const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error
            });
        }

        const options = {
            where: {
                email: value.email
            }
        };
        let user = await findUser(options);
        if (user) {
            return res.status(409).json({
                success: false,
                message: "Email is already exists"
            });
        }

        const createValues = {
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            password: hashedPassword(value.password)
        };
        user = await createUser(createValues);

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        const token = generateAccessToken(payload);

        const otp = generateOtp();

        user.emailOtp = otp;
        await user.save();

        sendMail({
            to: user.email,
            subject: "Email verification OTP",
            variables: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                otp
            },
            emailTemplate: "email_otp.ejs"
        });

        res.status(201).json({
            success: true,
            message: "Registeration successful",
            token
        });
    } catch (error) {
        console.error("register(): catch error : ", error);
        res.status(500).status({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};

export const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error
            });
        }

        const options = {
            where: {
                email: value.email
            }
        };
        const user = await findUser(options);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        const token = generateAccessToken(payload);

        if (!user.isEmailVerified) {
            const otp = generateOtp();

            user.emailOtp = otp;
            await user.save();

            sendMail({
                to: user.email,
                subject: "Email verification OTP",
                variables: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    otp
                },
                emailTemplate: "email_otp.ejs"
            });
        }

        res.status(201).json({
            success: true,
            message: "Registeration successful",
            token
        });
    } catch (error) {
        console.error("register(): catch error : ", error);
        res.status(500).status({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};

export const profile = async (req, res) => {
    console.log(req.user);
    res.json(req.user);
};

export const verifyOtp = async (req, res) => {
    try {
        const { email } = req.user;
        const { error, value } = verifyOtpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error
            });
        }

        const options = {
            where: {
                email
            },
        };
        const user = await findUser(options);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Already verified"
            });
        }

        if (value.otp != user.emailOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        user.emailOtp = null;
        user.isEmailVerified = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            isEmailVerified: user.isEmailVerified
        });
    } catch (error) {
        console.error("verifyOtp(): catch error : ", error);
        res.status(500).status({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};