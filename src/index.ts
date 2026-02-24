import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

app.get("/", (_, res) => {
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

server.listen(PORT, () => {
    console.log(`🟢 API Gateway is listening on port ${PORT}`);
});