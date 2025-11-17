import express from "express";
import { adminLoginController, loginUserController, logoutUserController, registerUserController } from "../controllers/authController.js";

const authRoute = express.Router();

authRoute.post("/register", registerUserController);
authRoute.post("/login", loginUserController);
authRoute.post("/admin/login", adminLoginController);
authRoute.post("/logout", logoutUserController);

export default authRoute