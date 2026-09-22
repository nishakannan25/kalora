export interface ImageProcessResult {
  processedImageUrl: string;
  metadata: Record<string, any>;
}

export interface CatalogAnalysisResult {
  title: Record<string, string>;
  description: Record<string, string>;
  suggestedTags: string[];
  craftCategory?: string;
}

export interface ValuationResult {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  factors: string[];
}

export interface VisionService {
  analyzeCraftImage(imageBuffer: Buffer | string): Promise<CatalogAnalysisResult>;
  removeBackground(imageBuffer: Buffer | string): Promise<ImageProcessResult>;
  enhanceLighting(imageBuffer: Buffer | string): Promise<ImageProcessResult>;
}

export interface SpeechService {
  transcribeAudio(audioBuffer: Buffer | string, language?: string): Promise<string>;
  synthesizeSpeech(text: string, language: string): Promise<Buffer>;
}

export interface TranslationService {
  translateText(text: string, fromLang: string, toLang: string): Promise<string>;
  multiTranslate(text: string, sourceLang: string, targetLangs: string[]): Promise<Record<string, string>>;
}

export interface CatalogService {
  generateSmartCatalog(imageInput: string, voiceDescription?: string): Promise<CatalogAnalysisResult>;
}

export interface PricingService {
  estimateCraftValuation(details: {
    craftCategory: string;
    materialsUsed?: string[];
    hoursSpent?: number;
    dimensions?: string;
  }): Promise<ValuationResult>;
}

export interface ImageProcessingService {
  processForCatalog(imageInput: string): Promise<ImageProcessResult>;
}

export interface AIService {
  vision: VisionService;
  speech: SpeechService;
  translation: TranslationService;
  catalog: CatalogService;
  pricing: PricingService;
  imageProcessing: ImageProcessingService;
}
