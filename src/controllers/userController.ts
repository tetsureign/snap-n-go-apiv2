import { Response } from "express";

import { getUserById, softDelUser } from "@/models/userModel";
import { AuthenticatedRequest } from "@/types";

import logger from "@/utils/logger";

export const handleGetMyInfo = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = await getUserById(req.user!.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    logger.error(error, "Error fetching user.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const handleSoftDelUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await softDelUser(req.user!.userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted.",
      });
    }

    return res.json({ success: true });
  } catch (error) {
    logger.error(error, "Error soft deleting user.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
