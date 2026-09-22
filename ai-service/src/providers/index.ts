import {
  AIService,
  VisionService,
  SpeechService,
  TranslationService,
  CatalogService,
  PricingService,
  ImageProcessingService,
  CatalogAnalysisResult,
  ImageProcessResult,
  ValuationResult
} from "../interfaces";

export class LocalFallbackVisionService implements VisionService {
  async analyzeCraftImage(imageBuffer: Buffer | string): Promise<CatalogAnalysisResult> {
    return {
      title: {
        en: "Handcrafted Traditional Artisan Item",
        ta: "கைவினைஞர் தயாரிப்பு கைவினை பொருள்",
        hi: "हस्तनिर्मित पारंपरिक कारीगर वस्तु"
      },
      description: {
        en: "Beautifully handcrafted by rural artisans using traditional heritage techniques.",
        ta: "பாரம்பரிய பாரம்பரிய நுட்பங்களைப் பயன்படுத்தி கிராமப்புற கைவினைஞர்களால் அழகாக வடிவமைக்கப்பட்டது.",
        hi: "पारंपरिक विरासत तकनीकों का उपयोग करके ग्रामीण कारीगरों द्वारा सुंदर ढंग से हस्तनिर्मित।"
      },
      suggestedTags: ["Handmade", "Heritage", "Artisan"],
      craftCategory: "WOODWORK"
    };
  }

  async removeBackground(imageBuffer: Buffer | string): Promise<ImageProcessResult> {
    return {
      processedImageUrl: typeof imageBuffer === "string" ? imageBuffer : "data:image/jpeg;base64,placeholder",
      metadata: { action: "background_removed_fallback" }
    };
  }

  async enhanceLighting(imageBuffer: Buffer | string): Promise<ImageProcessResult> {
    return {
      processedImageUrl: typeof imageBuffer === "string" ? imageBuffer : "data:image/jpeg;base64,placeholder",
      metadata: { action: "lighting_enhanced_fallback" }
    };
  }
}

export class LocalFallbackSpeechService implements SpeechService {
  async transcribeAudio(audioBuffer: Buffer | string, language?: string): Promise<string> {
    return "Voice description transcribed successfully via local fallback.";
  }

  async synthesizeSpeech(text: string, language: string): Promise<Buffer> {
    return Buffer.from(text);
  }
}

export class LocalFallbackTranslationService implements TranslationService {
  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    return `[${toLang.toUpperCase()}] ${text}`;
  }

  async multiTranslate(text: string, sourceLang: string, targetLangs: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    targetLangs.forEach(lang => {
      result[lang] = `[${lang.toUpperCase()}] ${text}`;
    });
    return result;
  }
}

export class LocalFallbackCatalogService implements CatalogService {
  constructor(private vision: VisionService) {}

  async generateSmartCatalog(imageInput: string, voiceDescription?: string): Promise<CatalogAnalysisResult> {
    const base = await this.vision.analyzeCraftImage(imageInput);
    if (voiceDescription) {
      base.description.en += ` (${voiceDescription})`;
    }
    return base;
  }
}

export class LocalFallbackPricingService implements PricingService {
  async estimateCraftValuation(details: {
    craftCategory: string;
    materialsUsed?: string[];
    hoursSpent?: number;
    dimensions?: string;
  }): Promise<ValuationResult> {
    const hours = details.hoursSpent || 5;
    const base = hours * 150 + 300;
    return {
      recommendedPrice: base,
      minPrice: Math.floor(base * 0.85),
      maxPrice: Math.ceil(base * 1.25),
      factors: ["Artisan time", "Material baseline", "Heritage craftsmanship value"]
    };
  }
}

export class LocalFallbackImageProcessingService implements ImageProcessingService {
  async processForCatalog(imageInput: string): Promise<ImageProcessResult> {
    return {
      processedImageUrl: imageInput,
      metadata: { process: "fallback_studio_lighting" }
    };
  }
}

export class AIServiceProvider implements AIService {
  public vision: VisionService;
  public speech: SpeechService;
  public translation: TranslationService;
  public catalog: CatalogService;
  public pricing: PricingService;
  public imageProcessing: ImageProcessingService;

  constructor() {
    this.vision = new LocalFallbackVisionService();
    this.speech = new LocalFallbackSpeechService();
    this.translation = new LocalFallbackTranslationService();
    this.catalog = new LocalFallbackCatalogService(this.vision);
    this.pricing = new LocalFallbackPricingService();
    this.imageProcessing = new LocalFallbackImageProcessingService();
  }
}
