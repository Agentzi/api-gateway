import { Request, Response } from "express";
import axios from "axios";
import HttpStatus from "./utils/http-status";
import http from "http";
import https from "https";

/**
 * @access proxyRequest()
 * @param targetUrl - Target URL
 * @description Proxy request to downstream services.
 *  For multipart/form-data (file uploads), pipes the raw request stream
 *  directly using native http/https so that boundaries and buffers are preserved end-to-end.
 */
const proxyRequest = async (req: Request, res: Response, targetUrl: string) => {
  try {
    const headers: Record<string, any> = { ...req.headers };
    delete headers.host;

    if ((req as any).user?.id) {
      headers["x-user-id"] = (req as any).user.id;
    }

    const isMultipart = req.headers["content-type"]?.includes(
      "multipart/form-data",
    );

    if (isMultipart) {
      const targetUrlParsed = new URL(`${targetUrl}${req.originalUrl}`);
      const options = {
        method: req.method,
        headers,
      };

      return new Promise<void>((resolve) => {
        const client = targetUrlParsed.protocol === "https:" ? https : http;
        const proxyReq = client.request(
          targetUrlParsed,
          options,
          (proxyRes) => {
            res.status(proxyRes.statusCode || 500);
            Object.keys(proxyRes.headers).forEach((key) => {
              const headerValue = proxyRes.headers[key];
              if (headerValue) {
                res.setHeader(key, headerValue);
              }
            });
            proxyRes.pipe(res);
            resolve();
          },
        );

        proxyReq.on("error", (error: any) => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Gateway Error", error: error.message });
          resolve();
        });

        req.pipe(proxyReq);
      });
    }

    // For non-multipart requests, use Axios with parsed JSON body
    let data: any;
    if (req.method === "GET") {
      data = undefined;
    } else {
      data = req.body;
      delete headers["content-length"];
    }

    const response = await axios({
      method: req.method,
      url: `${targetUrl}${req.originalUrl}`,
      data,
      headers,
      validateStatus: () => true,
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
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Gateway Error", error: error.message });
  }
};

export default proxyRequest;
