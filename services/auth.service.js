import User from "../models/user.model.js";

export const checkedLoggedUser = async (user) => {
    return await User.findOne({
        where: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });
};

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


