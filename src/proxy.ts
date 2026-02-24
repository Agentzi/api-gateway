import { Request, Response } from "express";
import axios from "axios";
import HttpStatus from "./utils/http-status";

/**
 * @access proxyRequest()
 * @param targetUrl - Target URL
 * @description This is the proxy request function which will proxy the request to the target service
 */
const proxyRequest = async (req: Request, res: Response, targetUrl: string) => {
    try {
        const headers = { ...req.headers };
        delete headers.host;
        delete headers["content-length"];

        if ((req as any).user?.id) {
            headers["x-user-id"] = (req as any).user.id;
        }

        const response = await axios({
            method: req.method,
            url: `${targetUrl}${req.originalUrl}`,
            data: req.method !== "GET" ? req.body : undefined,
            headers,
        });

        const setCookieHeader = response.headers["set-cookie"];
        if (setCookieHeader) {
            res.setHeader("set-cookie", setCookieHeader);
        }

        return res.status(response.status).json(response.data);
    } catch (error: any) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Gateway Error", error: error.message });
    }
};

export default proxyRequest;