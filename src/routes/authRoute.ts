import { FastifyPluginAsync } from "fastify";
import {
  handleLoginByGoogleId,
  handleRefreshToken,
} from "@/controllers/authController";

const authRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post("/login/google", handleLoginByGoogleId);
  fastify.post("/refresh", handleRefreshToken);
};

export default authRouter;
