import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./utils/logger";
import { SERVICES } from "./config/services";
import authMiddleware from "./middlewares/auth.middleware";
import HttpStatus from "./utils/http-status";
import proxyRequest from "./proxy";
import "dotenv/config";
import http from "http";

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }),
);

app.get("/", (_, res) => {
  logger.info("Health check ping received on /");
  res.status(HttpStatus.OK).json({ message: "🟢 API Gateway is running..." });
});

app.use("/api/v1/auth", (req: Request, res: Response) => {
  proxyRequest(req, res, SERVICES.AUTH);
});

app.use("/api/v1/user", authMiddleware, (req: Request, res: Response) => {
  proxyRequest(req, res, SERVICES.AUTH);
});

app.use("/api/v1/agent", authMiddleware, (req: Request, res: Response) => {
  proxyRequest(req, res, SERVICES.AGENT);
});

app.use("/api/v1/scheduler", (req: Request, res: Response) => {
  proxyRequest(req, res, SERVICES.SCHEDULER);
});

app.use("/api/inngest", (req: Request, res: Response) => {
  proxyRequest(req, res, SERVICES.SCHEDULER);
});

server.listen(PORT, () => {
  logger.info(`🟢 API Gateway is listening on port ${PORT}`);
});
