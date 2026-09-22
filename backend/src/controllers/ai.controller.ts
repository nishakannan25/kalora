import { Response, NextFunction } from "express";
import { speechService } from "../services/ai/SpeechService";
import { translationService } from "../services/ai/TranslationService";
import { AuthenticatedRequest } from "../middleware/auth";

export async function transcribeAudio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { audioBase64, language } = req.body;
    const result = await speechService.transcribe({ audioBase64, language });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || "Speech-to-text processing failed" });
  }
}

export async function translateText(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;
    const result = await translationService.translate({ text, sourceLanguage, targetLanguage });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || "Translation processing failed" });
  }
}
