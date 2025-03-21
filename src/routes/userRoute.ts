import express from "express";

import {
  handleCreateUser,
  handleGetUserByGoogleId,
} from "@/controllers/userController";

const userRouter = express.Router();

userRouter.post("/", handleCreateUser);
userRouter.get("/:googleId", handleGetUserByGoogleId);

export default userRouter;
