import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export function validateBody(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: "Validation Error",
        details: error.errors || error.message
      });
    }
  };
}
