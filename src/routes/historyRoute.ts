import express from "express";

import {
  handleAddMyQueryHistory,
  handleGetMyHistoryLazy,
  handleDeleteMyQueryHistory,
} from "@/controllers/historyController";

import { authenticator } from "@/middlewares/authenticator";

const historyRouter = express.Router();

historyRouter.post("/me", authenticator, handleAddMyQueryHistory);
historyRouter.get("/me", authenticator, handleGetMyHistoryLazy);
historyRouter.delete("/me", authenticator, handleDeleteMyQueryHistory);

export default historyRouter;
