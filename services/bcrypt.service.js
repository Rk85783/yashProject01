import bcrypt from "bcryptjs";

export const hashedPassword = (password) => bcrypt.hashSync(password, 10);

export const comparePassword = (password, hashPassword) => bcrypt.compareSync(password, hashPassword);