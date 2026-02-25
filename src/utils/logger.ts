import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

const logDirectory = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/api-gateway-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  maxSize: "20m",
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat,
  ),
  transports: [
    fileRotateTransport,
    new winston.transports.DailyRotateFile({
      filename: "logs/api-gateway-error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "30d",
      maxSize: "20m",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  );
}

export default logger;
