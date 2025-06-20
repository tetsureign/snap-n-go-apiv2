import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "@/types";
import { getUserById, softDeleteUser } from "@/services/userService";

export const handleGetMyInfo = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const user = await getUserById(req.user!.userId);

    if (!user) {
      return reply
        .status(404)
        .send({ success: false, message: "User not found." });
    }

    return reply.send({ success: true, data: user });
  } catch (error) {
    req.log.error(error, "Error fetching user.");
    return reply
      .status(500)
      .send({ success: false, message: "Internal server error." });
  }
};

export const handleSoftDelUser = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const result = await softDeleteUser(req.user!.userId);

    if (!result) {
      return reply.status(404).send({
        success: false,
        message: "User not found or already deleted.",
      });
    }

    return reply.send({ success: true });
  } catch (error) {
    req.log.error(error, "Error soft deleting user.");
    return reply
      .status(500)
      .send({ success: false, message: "Internal server error." });
  }
};
