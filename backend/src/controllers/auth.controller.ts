import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { otpService } from "../services/auth/OtpService";
import { AuthenticatedRequest } from "../middleware/auth";

export async function sendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, channel } = req.body;
    const result = await otpService.sendOtp({ phone, channel });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp } = req.body;
    const result = await otpService.verifyOtp({ phone, otp });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function registerArtisan(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerArtisan(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function registerBuyer(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerBuyer(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;
    const result = await authService.login(identifier, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken, role } = req.body;
    const result = await authService.googleAuth(idToken, role);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await authService.getMe(userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
