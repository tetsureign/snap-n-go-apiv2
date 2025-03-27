import express from "express";
import cors from "cors";
import "dotenv/config";

import detectRouter from "@/routes/detectionRoute";
import authRouter from "@/routes/authRoute";
import userRouter from "@/routes/userRoute";
import historyRouter from "@/routes/historyRoute";

import logger from "@/utils/logger";
import errorHandler from "@/middlewares/errorHandler";

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});
app.use(errorHandler);
app.use(cors());
app.use(express.json());

const routePrefix = process.env.ROUTE_PREFIX;

app.use(routePrefix + "/detect", detectRouter);
app.use(routePrefix + "/auth", authRouter);
app.use(routePrefix + "/user", userRouter);
app.use(routePrefix + "/history", historyRouter);

app.listen(port, "0.0.0.0", () => {
  logger.info(`[server] Server started. http://localhost:${port}`);
});
