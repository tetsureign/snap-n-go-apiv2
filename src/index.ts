import express from "express";
import cors from "cors";
import "dotenv/config";
import detect from "./routes/detectionRoute";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const routePrefix = process.env.ROUTE_PREFIX;

app.use(routePrefix + "/detect", detect);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
