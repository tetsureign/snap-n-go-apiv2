import { FastifyPluginAsync } from "fastify";
import { handleDetection } from "@/controllers/detectionController";

const detectRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", handleDetection);
};

export default detectRouter;
