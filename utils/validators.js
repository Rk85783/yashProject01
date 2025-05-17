import Joi from "joi";

export const registerSchema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().required().email().label("Email"),
    password: Joi.string().required().label("Password")
});

export const loginSchema = Joi.object({
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password")
});

export const verifyOtpSchema = Joi.object({
    otp: Joi.string().required().label("OTP")
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().required().email().label("Email")
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string().required().email().label("Email"),
    otp: Joi.string().required().label("OTP"),
    newPassword: Joi.string().required().label("New Password")
});

export const changeEmailSchema = Joi.object({
    newEmail: Joi.string().required().label("New Email"),
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().label("Current Password"),
    newPassword: Joi.string().required().label("New Password")
});