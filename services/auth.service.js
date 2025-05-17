import User from "../models/user.model.js";

export const findUser = async (options) => {
    return await User.findOne(options);
};

export const findAllUser = async (options) => {
    return await User.findAll(options);
};

export const createUser = async (values) => {
    return await User.create(values);
};

export const updateUser = async (values, options) => {
    return await User.update(values, options);
};


