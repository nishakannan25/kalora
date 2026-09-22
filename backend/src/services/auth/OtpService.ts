// ============================================================
// KALORA - OTP SERVICE
// Fast2SMS Quick SMS (No DLT)
// ============================================================

export interface SendOtpOptions {
  phone: string;
  channel?: 'SMS' | 'VOICE';
}

export interface SendOtpResponse {
  sessionId: string;
  otpLength: number;
  expiresInSeconds: number;
  message: string;
}

export interface VerifyOtpOptions {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  message: string;
}

export interface IOtpProvider {
  sendOtp(options: SendOtpOptions): Promise<SendOtpResponse>;
  verifyOtp(options: VerifyOtpOptions): Promise<VerifyOtpResponse>;
}

// ============================================================
// OTP STORE
// ============================================================

const otpStore = new Map<
  string,
  {
    otp: string;
    expiresAt: number;
  }
>();

// ============================================================
// MOCK OTP PROVIDER
// ============================================================

export class MockOtpProvider implements IOtpProvider {
  async sendOtp(
    options: SendOtpOptions
  ): Promise<SendOtpResponse> {
    const rawPhone = options.phone.replace(/\D/g, '');

    const cleanPhone =
      rawPhone.length >= 10
        ? rawPhone.slice(-10)
        : rawPhone;

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP valid for 5 minutes
    const expiresAt =
      Date.now() + 5 * 60 * 1000;

    // Store OTP
    otpStore.set(cleanPhone, {
      otp,
      expiresAt
    });

    otpStore.set(options.phone.trim(), {
      otp,
      expiresAt
    });

    console.log(
      `📱 [MOCK SMS] OTP [ ${otp} ] generated for ${cleanPhone}`
    );

    return {
      sessionId: `otp_sess_${Date.now()}`,
      otpLength: 6,
      expiresInSeconds: 300,
      message:
        `OTP generated successfully for ${cleanPhone}.`
    };
  }

  async verifyOtp(
    options: VerifyOtpOptions
  ): Promise<VerifyOtpResponse> {
    const rawPhone =
      options.phone.replace(/\D/g, '');

    const cleanPhone =
      rawPhone.length >= 10
        ? rawPhone.slice(-10)
        : rawPhone;

    const record =
      otpStore.get(cleanPhone) ||
      otpStore.get(options.phone.trim());

    if (!record) {
      return {
        verified: false,
        message:
          'OTP session expired or not found. Please request a new OTP.'
      };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanPhone);

      return {
        verified: false,
        message:
          'OTP expired. Please request a new OTP.'
      };
    }

    if (options.otp === record.otp) {
      otpStore.delete(cleanPhone);

      return {
        verified: true,
        message:
          'Phone number verified successfully.'
      };
    }

    return {
      verified: false,
      message:
        'Invalid OTP code. Please check and try again.'
    };
  }
}

// ============================================================
// TWILIO SMS PROVIDER
// ============================================================

export class TwilioSmsProvider
  implements IOtpProvider {

  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(
    accountSid: string,
    authToken: string,
    fromNumber: string
  ) {
    this.accountSid = accountSid.trim();
    this.authToken = authToken.trim();
    this.fromNumber = fromNumber.trim();
  }

  async sendOtp(
    options: SendOtpOptions
  ): Promise<SendOtpResponse> {

    const rawPhone =
      options.phone.replace(/\D/g, '');

    const cleanPhone =
      rawPhone.length === 10
        ? `+91${rawPhone}`
        : options.phone.startsWith('+')
          ? options.phone
          : `+${rawPhone}`;

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt =
      Date.now() + 5 * 60 * 1000;

    otpStore.set(cleanPhone, {
      otp,
      expiresAt
    });

    otpStore.set(rawPhone.slice(-10), {
      otp,
      expiresAt
    });

    try {
      console.log(
        `📡 [Twilio SMS] Sending OTP [ ${otp} ] to ${cleanPhone}...`
      );

      const body = new URLSearchParams({
        To: cleanPhone,
        From: this.fromNumber,
        Body:
          `Your KALORA Verification OTP is ${otp}. ` +
          `Valid for 5 minutes.`
      });

      const authHeader =
        'Basic ' +
        Buffer.from(
          `${this.accountSid}:${this.authToken}`
        ).toString('base64');

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',

          headers: {
            Authorization: authHeader,
            'Content-Type':
              'application/x-www-form-urlencoded'
          },

          body: body.toString()
        }
      );

      const data = await response.json();

      console.log(
        '📨 [Twilio Response]:',
        data.sid || data.message || data
      );

      if (response.ok && data.sid) {
        return {
          sessionId:
            `otp_sess_${Date.now()}`,
          otpLength: 6,
          expiresInSeconds: 300,
          message:
            `SMS OTP sent successfully to ${cleanPhone}.`
        };
      }

      throw new Error(
        data?.message ||
        'Twilio SMS dispatch failed.'
      );

    } catch (err: any) {

      console.error(
        '❌ [Twilio Error]:',
        err?.message || err
      );

      // Do not leave an OTP active if SMS failed
      otpStore.delete(cleanPhone);
      otpStore.delete(rawPhone.slice(-10));

      throw new Error(
        `SMS delivery failed: ${err?.message || 'Unknown Twilio error'
        }`
      );
    }
  }

  async verifyOtp(
    options: VerifyOtpOptions
  ): Promise<VerifyOtpResponse> {

    const rawPhone =
      options.phone.replace(/\D/g, '');

    const cleanPhone =
      rawPhone.length >= 10
        ? rawPhone.slice(-10)
        : rawPhone;

    const record =
      otpStore.get(cleanPhone) ||
      otpStore.get(options.phone.trim());

    if (!record) {
      return {
        verified: false,
        message:
          'OTP session expired or not found. Please request a new OTP.'
      };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanPhone);

      return {
        verified: false,
        message:
          'OTP expired. Please request a new OTP.'
      };
    }

    if (options.otp === record.otp) {
      otpStore.delete(cleanPhone);

      return {
        verified: true,
        message:
          'Phone number verified successfully.'
      };
    }

    return {
      verified: false,
      message:
        'Invalid OTP code. Please check and try again.'
    };
  }
}

// ============================================================
// FAST2SMS QUICK SMS PROVIDER
// ============================================================
//
// This uses:
// Fast2SMS → Quick SMS
// route = q
//
// It does NOT use:
// - Smart OTP
// - OTP ID
// - DLT Entity ID
// - DLT Sender ID
// - DLT Template
//
// ============================================================

export class Fast2SmsProvider
  implements IOtpProvider {

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey
      .trim()
      .replace(/^["']|["']$/g, '');
  }

  async sendOtp(
    options: SendOtpOptions
  ): Promise<SendOtpResponse> {

    // --------------------------------------------------------
    // CLEAN PHONE NUMBER
    // --------------------------------------------------------

    const rawPhone =
      options.phone.replace(/\D/g, '');

    const cleanPhone =
      rawPhone.length >= 10
        ? rawPhone.slice(-10)
        : rawPhone;

    if (cleanPhone.length !== 10) {
      throw new Error(
        'Invalid Indian mobile number.'
      );
    }

    // --------------------------------------------------------
    // GENERATE 6-DIGIT OTP
    // --------------------------------------------------------

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // --------------------------------------------------------
    // OTP EXPIRATION
    // --------------------------------------------------------

    const expiresAt =
      Date.now() + 5 * 60 * 1000;

    // --------------------------------------------------------
    // STORE OTP
    // --------------------------------------------------------

    otpStore.set(cleanPhone, {
      otp,
      expiresAt
    });

    try {

      console.log(
        `📡 [Fast2SMS] Sending SMS OTP [ ${otp} ] to +91${cleanPhone}...`
      );

      // ------------------------------------------------------
      // SMS MESSAGE
      // ------------------------------------------------------

      const message =
        `Your KALORA Verification OTP is ${otp}. ` +
        `Valid for 5 minutes. Do not share this OTP.`;

      // ------------------------------------------------------
      // FAST2SMS QUICK SMS API
      // ------------------------------------------------------
      //
      // Endpoint:
      // https://www.fast2sms.com/dev/bulkV2
      //
      // Route:
      // q = Quick SMS
      //
      // Authorization:
      // API key in request header
      //
      // ------------------------------------------------------

      const response = await fetch(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          method: 'POST',

          headers: {
            Authorization: this.apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },

          body: JSON.stringify({
            route: 'q',
            message: message,
            numbers: cleanPhone,

            // Ask Fast2SMS to include delivery/cost
            // information when available.
            sms_details: '1'
          })
        }
      );

      // ------------------------------------------------------
      // PARSE RESPONSE
      // ------------------------------------------------------

      const data = await response.json();

      console.log(
        '📨 [Fast2SMS Response]:',
        data
      );

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      if (
        response.ok &&
        data?.return === true
      ) {

        console.log(
          `✅ [Fast2SMS] SMS request accepted for +91${cleanPhone}`
        );

        return {
          sessionId:
            `otp_sess_${Date.now()}`,

          otpLength: 6,

          expiresInSeconds: 300,

          message:
            `OTP sent successfully to +91${cleanPhone}.`
        };
      }

      // ------------------------------------------------------
      // FAST2SMS ERROR
      // ------------------------------------------------------

      const providerMessage =
        Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ||
          'Fast2SMS rejected the SMS request.';

      throw new Error(
        `Fast2SMS ${data?.status_code || response.status}: ${providerMessage}`
      );

    } catch (err: any) {

      console.error(
        '❌ [Fast2SMS Error]:',
        err?.message || err
      );

      // ------------------------------------------------------
      // IMPORTANT
      // Remove OTP when SMS was not sent.
      // ------------------------------------------------------

      otpStore.delete(cleanPhone);

      // ------------------------------------------------------
      // DO NOT RETURN SUCCESS HERE.
      // ------------------------------------------------------

      throw new Error(
        `SMS delivery failed: ${err?.message ||
        'Unknown Fast2SMS error'
        }`
      );
    }
  }

  // ==========================================================
  // VERIFY FAST2SMS OTP
  // ==========================================================

  async verifyOtp(
    options: VerifyOtpOptions
  ): Promise<VerifyOtpResponse> {

    const rawPhone =
      options.phone.replace(/\D/g, '');

    const cleanPhone =
      rawPhone.length >= 10
        ? rawPhone.slice(-10)
        : rawPhone;

    // --------------------------------------------------------
    // GET OTP
    // --------------------------------------------------------

    const record =
      otpStore.get(cleanPhone) ||
      otpStore.get(options.phone.trim());

    if (!record) {
      return {
        verified: false,
        message:
          'OTP session expired or not found. Please request a new OTP.'
      };
    }

    // --------------------------------------------------------
    // CHECK EXPIRATION
    // --------------------------------------------------------

    if (Date.now() > record.expiresAt) {

      otpStore.delete(cleanPhone);

      return {
        verified: false,
        message:
          'OTP expired. Please request a new OTP.'
      };
    }

    // --------------------------------------------------------
    // VERIFY OTP
    // --------------------------------------------------------

    if (options.otp === record.otp) {

      otpStore.delete(cleanPhone);

      return {
        verified: true,
        message:
          'Phone number verified successfully.'
      };
    }

    // --------------------------------------------------------
    // INVALID OTP
    // --------------------------------------------------------

    return {
      verified: false,
      message:
        'Invalid OTP code. Please check and try again.'
    };
  }
}

// ============================================================
// OTP SERVICE
// ============================================================

export class OtpService {

  private provider: IOtpProvider;

  constructor(provider?: IOtpProvider) {

    // --------------------------------------------------------
    // Custom provider
    // --------------------------------------------------------

    if (provider) {

      this.provider = provider;

      return;
    }

    // --------------------------------------------------------
    // FAST2SMS
    // --------------------------------------------------------

    if (
      process.env.FAST2SMS_API_KEY &&
      process.env.FAST2SMS_API_KEY.trim().length > 0
    ) {

      console.log(
        '🔑 [OtpService] Initialized with Fast2SMS Quick SMS Gateway'
      );

      this.provider =
        new Fast2SmsProvider(
          process.env.FAST2SMS_API_KEY
        );

      return;
    }

    // --------------------------------------------------------
    // TWILIO
    // --------------------------------------------------------

    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {

      console.log(
        '🔑 [OtpService] Initialized with Twilio SMS Gateway'
      );

      this.provider =
        new TwilioSmsProvider(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN,
          process.env.TWILIO_PHONE_NUMBER
        );

      return;
    }

    // --------------------------------------------------------
    // MOCK
    // --------------------------------------------------------

    console.log(
      'ℹ️ [OtpService] Initialized with Mock SMS Provider'
    );

    this.provider =
      new MockOtpProvider();
  }

  // ==========================================================
  // SEND OTP
  // ==========================================================

  async sendOtp(
    options: SendOtpOptions
  ): Promise<SendOtpResponse> {

    if (
      !options.phone ||
      options.phone.trim().length < 8
    ) {
      throw new Error(
        'Valid phone number is required.'
      );
    }

    return this.provider.sendOtp(options);
  }

  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  async verifyOtp(
    options: VerifyOtpOptions
  ): Promise<VerifyOtpResponse> {

    if (
      !options.phone ||
      !options.otp
    ) {
      throw new Error(
        'Phone number and OTP code are required.'
      );
    }

    return this.provider.verifyOtp(options);
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const otpService =
  new OtpService();