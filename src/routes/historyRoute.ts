import express from "express";

import {
  handleAddMySearchHistory,
  handleGetMyHistory,
} from "@/controllers/historyController";

import { authenticator } from "@/middlewares/authenticator";

const historyRouter = express.Router();

historyRouter.post("/me", authenticator, handleAddMySearchHistory);
historyRouter.get("/me", handleGetMyHistory);

export default historyRouter;
