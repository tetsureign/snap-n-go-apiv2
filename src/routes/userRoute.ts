import express from "express";

import {
  handleGetUserByGoogleId,
  handleSoftDelUser,
} from "@/controllers/userController";

const userRouter = express.Router();

// TODO: Add auth for those routes and don't use id in the url
userRouter.get("/me/:googleId", handleGetUserByGoogleId);
userRouter.delete("/me/delete/:id", handleSoftDelUser);

export default userRouter;
