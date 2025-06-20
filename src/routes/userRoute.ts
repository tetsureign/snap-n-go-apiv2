import { FastifyPluginAsync } from "fastify";
import { authenticator } from "@/middlewares/authenticator";
import {
  handleGetMyInfo,
  handleSoftDelUser,
} from "@/controllers/userController";

const userRouter: FastifyPluginAsync = async (fastify) => {
  fastify.get("/me", { preHandler: authenticator }, handleGetMyInfo);
  fastify.delete(
    "/me/delete",
    { preHandler: authenticator },
    handleSoftDelUser
  );
};

export default userRouter;
