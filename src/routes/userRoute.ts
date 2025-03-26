import express from "express";

import {
  handleCreateUserByGoogleId,
  handleGetUserByGoogleId,
  handleSoftDelUser,
} from "@/controllers/userController";

const userRouter = express.Router();

userRouter.post("/google", handleCreateUserByGoogleId);
userRouter.get("/:googleId", handleGetUserByGoogleId);
userRouter.delete("/:id", handleSoftDelUser);

export default userRouter;
