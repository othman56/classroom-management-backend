import { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet.js";
import { slidingWindow } from "@arcjet/node";
const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "test") return next();

  try {
    const role: RateLimitRole = req.user?.role ?? "guest";

    let limit: number;
    let message: string;

    switch (role) {
      case "admin":
        limit = 20;
        message = "Admin request exceeded (20 per minute). Slow down";
        break;
      case "teacher":
      case "student":
        limit = 10;
        message = "User request exceeded (10 per minute). Please wait";
        break;
      default:
        limit = 5;
        message =
          "Guest request exceeded (5 per minute). Please Sign up for higher limits";
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: limit,
      }),
    );

    const arcjectRequest = {
      headers: req.headers,
      method: req.method,
      url: req.originalUrl ?? req.url,
      socket: {
        remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0",
      },
    };

    const decision = await client.protect(arcjectRequest);

    if (decision.isDenied() && decision.reason.isBot()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed.",
      });
    }
    if (decision.isDenied() && decision.reason.isShield()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Request denied by security policy.",
      });
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res.status(429).json({
        error: "Too Many Requests",
        message,
      });
    }
    if (decision.isErrored()) {
      console.warn("Arcjet unavailable:", decision.reason);
      return next();
    }

    next();
  } catch (error) {
    console.error("Arject middleware error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong with security middleware ",
    });
  }
};

export default securityMiddleware;
