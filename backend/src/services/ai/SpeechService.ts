export interface SpeechToTextOptions {
  audioBase64?: string;
  language?: 'ta' | 'hi' | 'en' | 'auto';
}

export interface AudioQualityResult {
  score: number;
  status: 'EXCELLENT' | 'GOOD' | 'POOR';
  rmsDb: number;
  clippingRatio: number;
  snrDb: number;
  feedback: string;
  isUsable: boolean;
}

export interface SpeechToTextResponse {
  transcript: string;
  detectedLanguage: 'ta' | 'hi' | 'en';
  confidence: number;
  requiresConfirmation: boolean;
  audioQuality: AudioQualityResult;
}

export interface ISpeechProvider {
  transcribe(options: SpeechToTextOptions): Promise<SpeechToTextResponse>;
}

export class MockSpeechProvider implements ISpeechProvider {
  async transcribe(options: SpeechToTextOptions): Promise<SpeechToTextResponse> {
    const requestedLang = options.language || 'auto';
    let lang: 'ta' | 'hi' | 'en' = 'en';

    if (requestedLang === 'auto') {
      lang = 'ta'; 
    } else {
      lang = requestedLang;
    }

    const mockAudioQuality: AudioQualityResult = {
      score: 94,
      status: 'EXCELLENT',
      rmsDb: -18.0,
      clippingRatio: 0.0,
      snrDb: 24.5,
      feedback: 'Audio signal clear with high speech clarity.',
      isUsable: true
    };
    
    if (lang === 'ta') {
      return {
        transcript: 'நான் 4500 ரூபாயில் ஒரு கைத்தறி சேலை நெய்துள்ளேன்.',
        detectedLanguage: 'ta',
        confidence: 0.97,
        requiresConfirmation: false,
        audioQuality: mockAudioQuality
      };
    } else if (lang === 'hi') {
      return {
        transcript: 'मैंने 4500 रुपये की कीमत वाली एक हथकरघा साड़ी तैयार की है।',
        detectedLanguage: 'hi',
        confidence: 0.96,
        requiresConfirmation: false,
        audioQuality: mockAudioQuality
      };
    }

    // Default English transcript with minor grammatical phrase to showcase AI grammar auto-correction
    return {
      transcript: 'I have done an handloom saree with price of 4500',
      detectedLanguage: 'en',
      confidence: 0.98,
      requiresConfirmation: false,
      audioQuality: mockAudioQuality
    };
  }
}

export class SpeechService {
  private provider: ISpeechProvider;

  constructor(provider?: ISpeechProvider) {
    this.provider = provider || new MockSpeechProvider();
  }

  async transcribe(options: SpeechToTextOptions): Promise<SpeechToTextResponse> {
    if (options.audioBase64 && options.audioBase64.length < 20) {
      throw new Error('Audio recording is empty or invalid.');
    }
    const res = await this.provider.transcribe(options);
    if (res.confidence < 0.80) {
      res.requiresConfirmation = true;
    }
    return res;
  }
}

export const speechService = new SpeechService();
