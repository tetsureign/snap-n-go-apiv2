import express from "express";

import {
  handleCreateUserByGoogleId,
  handleGetUserByGoogleId,
} from "@/controllers/userController";

const userRouter = express.Router();

userRouter.post("/google", handleCreateUserByGoogleId);
userRouter.get("/:googleId", handleGetUserByGoogleId);

export default userRouter;
