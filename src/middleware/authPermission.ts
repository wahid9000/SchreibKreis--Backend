import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export const authPermission = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: new Headers(req.headers as Record<string, string>),
      });

      if (!session?.user) {
        return res.status(401).json({
          success: false,
          status: "fail",
          statusCode: 401,
          message: "Authentication required",
        });
      }

      if (!session?.user.emailVerified) {
        return res.status(401).json({
          success: false,
          status: "fail",
          statusCode: 401,
          message: "Authentication required",
        });
      }

        if (session?.user.status !== 'ACTIVE') {
        return res.status(401).json({
          success: false,
          status: "fail",
          statusCode: 401,
          message: "User status is not active. Please contact support",
        });
      }

      const userRole = String(session.user.role || "USER").toUpperCase();
      const roles = allowedRoles.map((role) => role.toUpperCase());

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          status: "fail",
          statusCode: 403,
          message: "You do not have permission to access this resource",
        });
      }

      //assign the user to the request object
      (req as Request & { user?: typeof session.user }).user = session.user; 
      next();
    } catch {
      return res.status(401).json({
        success: false,
        status: "fail",
        statusCode: 401,
        message: "Invalid or expired session",
      });
    }
  };
};
