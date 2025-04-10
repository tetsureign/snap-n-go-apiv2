import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import "dotenv/config";

import detectRouter from "@/routes/detectionRoute";
import authRouter from "@/routes/authRoute";
import userRouter from "@/routes/userRoute";
import historyRouter from "@/routes/historyRoute";

import logger from "@/utils/logger";
import errorHandler from "@/middlewares/errorHandler";

const RATE_LIMITER_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMITER_MAX = 100; // Limit each IP to 100 requests per windowMs

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const limiter = rateLimit({
  windowMs: RATE_LIMITER_WINDOW_MS,
  max: RATE_LIMITER_MAX,
  message: "Too many requests from this IP, please try again later.",
});

app.use(helmet());
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});
app.use(errorHandler);
app.use(cors());
app.use(limiter);
app.use(express.json());

const routePrefix = process.env.ROUTE_PREFIX;

app.use(routePrefix + "/detect", detectRouter);
app.use(routePrefix + "/auth", authRouter);
app.use(routePrefix + "/user", userRouter);
app.use(routePrefix + "/history", historyRouter);

app.listen(port, "0.0.0.0", () => {
  logger.info(`[server] Server started. http://localhost:${port}`);
});
