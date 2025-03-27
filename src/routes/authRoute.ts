import express from "express";
import {
  handleLoginByGoogleId,
  handleRefreshToken,
} from "@/controllers/authController";

const authRouter = express.Router();

authRouter.post("/login/google", handleLoginByGoogleId);
authRouter.post("/refresh", handleRefreshToken);

export default authRouter;
