import express from "express";

import { authenticator } from "@/middlewares/authenticator";

import {
  handleGetMyInfo,
  handleSoftDelUser,
} from "@/controllers/userController";

const userRouter = express.Router();

userRouter.get("/me", authenticator, handleGetMyInfo);
userRouter.delete("/me/delete", authenticator, handleSoftDelUser);

export default userRouter;
