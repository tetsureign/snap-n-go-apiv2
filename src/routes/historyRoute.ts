import { FastifyPluginAsync } from "fastify";
import {
  handleAddMyQueryHistory,
  handleGetMyHistoryLazy,
  handleDeleteMyQueryHistory,
} from "@/controllers/historyController";
import { authenticator } from "@/middlewares/authenticator";

const historyRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post("/me", { preHandler: authenticator }, handleAddMyQueryHistory);
  fastify.get("/me", { preHandler: authenticator }, handleGetMyHistoryLazy);
  fastify.delete(
    "/me",
    { preHandler: authenticator },
    handleDeleteMyQueryHistory
  );
};

export default historyRouter;
