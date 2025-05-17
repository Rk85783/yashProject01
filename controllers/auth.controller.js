import { checkedLoggedUser, createUser, findUser } from "../services/auth.service.js";
import { comparePassword, hashedPassword } from "../services/bcrypt.service.js";
import { sendMail } from "../services/email.service.js";
import { generateAccessToken } from "../services/jwt.service.js";
import { generateOtp } from "../utils/helper.js";
import { changeEmailSchema, changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyOtpSchema } from "../utils/validators.js";

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
            emailTemplate: "verification_otp.ejs"
        });

        res.status(201).json({
            success: true,
            message: "Registeration successful",
            token,
            isEmailVerified: user.isEmailVerified
        });
    } catch (error) {
        console.error("register(): catch error : ", error);
        res.status(500).json({
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

        if (!comparePassword(value.password, user.password)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Credencials"
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
                emailTemplate: "verification_otp.ejs"
            });
        }

        res.status(201).json({
            success: true,
            message: "Registeration successful",
            token,
            isEmailVerified: user.isEmailVerified
        });
    } catch (error) {
        console.error("register(): catch error : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};

export const profile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Profile details fetched successfully",
            profile: req.user
        });
    } catch (error) {
        console.error("profile(): catch error : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const loggedUser = await checkedLoggedUser(req.user);

        if (loggedUser.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        loggedUser.emailOtp = generateOtp();
        await loggedUser.save();

        sendMail({
            to: loggedUser.email,
            subject: "Resend OTP",
            variables: {
                firstName: loggedUser.firstName,
                lastName: loggedUser.lastName,
                otp: loggedUser.emailOtp
            },
            emailTemplate: "verification_otp.ejs"
        });

        res.status(200).json({
            success: true,
            message: "Profile details fetched successfully",
            isEmailVerified: loggedUser.isEmailVerified
        });
    } catch (error) {
        console.error("profile(): catch error : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
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
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { error, value } = forgotPasswordSchema.validate(req.body);
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
            },
        };
        const user = await findUser(options);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = generateOtp();

        user.emailOtp = otp;
        await user.save();

        sendMail({
            to: user.email,
            subject: "Forgot Password OTP",
            variables: {
                firstName: user.firstName,
                lastName: user.lastName,
                otp
            },
            emailTemplate: "forgot_password.ejs"
        });

        res.status(200).json({
            success: true,
            message: "Forgot password OTP send successfully"
        });
    } catch (error) {
        console.error("profile(): catch error : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { error, value } = resetPasswordSchema.validate(req.body);
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
            },
        };
        const user = await findUser(options);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (value.otp != user.emailOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        user.emailOtp = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Reset password successfully"
        });
    } catch (error) {
        console.error("profile(): catch error : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { id, email, role } = req.user;
        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error
            });
        }

        const options = {
            where: {
                id,
                email,
                role
            },
        };
        const user = await findUser(options);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log(comparePassword(value.currentPassword, user.password));
        if (!comparePassword(value.currentPassword, user.password)) {
            return res.status(404).json({
                success: false,
                message: "Current Password is not matched"
            });
        }

        user.password = hashedPassword(value.newPassword);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Change password successfully"
        });
    } catch (error) {
        console.error("changePassword(): catch error : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};

export const changeEmail = async (req, res) => {
    try {
        const { id, email, role } = req.user;
        const { error, value } = changeEmailSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error
            });
        }

        const options = {
            where: {
                id,
                email,
                role
            },
        };
        const user = await findUser(options);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        const findOptions = {
            where: {
                email: value.newEmail
            },
        };
        const isEmailExist = await findUser(findOptions);
        if (isEmailExist) {
            return res.status(404).json({
                success: false,
                message: "Email is already exist"
            });
        }

        user.emailOtp = generateOtp();
        await user.save();

        sendMail({
            to: user.email,
            subject: "Email verification OTP",
            variables: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                otp: user.emailOtp
            },
            emailTemplate: "verification_otp.ejs"
        });

        res.status(200).json({
            success: true,
            message: "Email OTP send to your new email, please verify."
        });
    } catch (error) {
        console.error("changeEmail(): catch error : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.stack
        });
    }
};