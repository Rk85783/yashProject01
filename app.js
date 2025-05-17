import "dotenv/config";
import express from "express";
import cors from "cors";
import sequelize from "./config/db.config.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/auth", authRouter);

try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync({ force: false, alter: false, logging: false });
    console.log("All models were synchronized successfully.");

    const port = process.env.PORT || 4000;
    app.listen(port, console.info(`Api server is running on port ${port}`));
} catch (error) {
    console.error("Unable to connect to the database:", error);
}