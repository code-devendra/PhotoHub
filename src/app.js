import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// creating public/temp directory
const dir = "./public";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
  console.log(`Directory ${dir} created successfully.`);
}

const tempDir = "./public/temp";

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
  console.log(`Directory ${tempDir} created successfully. inside ${dir}`);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import photoRouter from "./routes/photo.routes.js";
import likeRouter from "./routes/like.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import setRouter from "./routes/set.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/photos", photoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/sets", setRouter);

// Invalid API call
import { ApiError } from "./utils/ApiError.js";

app.use("*", (_, res) => {
  res.status(404).json(new ApiError(404, "INVALID ROUTE!! NO API FOUND"));
});

export { app };
