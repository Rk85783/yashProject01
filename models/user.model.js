import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js"; 

const User = sequelize.define(
    "User",
    {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM,
            values: ["admin", "teacher", "student"],
            defaultValue: "student"
        },
        emailOtp: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    },
    {
        underscored: true
    }
);

export default User;