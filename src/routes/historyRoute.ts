import express from "express";

import {
  handleAddSearchHistory,
  handleGetHistoryByUserId,
} from "@/controllers/historyController";

const historyRouter = express.Router();

historyRouter.post("/", handleAddSearchHistory);
historyRouter.get("/:userId", handleGetHistoryByUserId);

export default historyRouter;
