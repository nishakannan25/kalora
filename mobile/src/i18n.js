export const TRANSLATIONS = {
  en: {
    welcome: "Welcome to KALORA",
    tagline: "Empowering Rural Artisans with Intelligent Product Catalogs",
    selectLanguage: "Select Your Preferred Language",
    getStarted: "Get Started",
    login: "Log In",
    register: "Register New Artisan",
    dashboard: "Artisan Dashboard",
    addProduct: "Add New Product",
    voiceInput: "Tap & Speak Product Details",
    cameraUpload: "Take Photo / Select Image",
    processing: "Analyzing Product with AI...",
    extractedInfo: "Extracted Specifications",
    missingInfo: "Artisan Quick Questions",
    catalogPreview: "Product Catalog Preview",
    priceAdvisor: "Fair Price Advisor",
    qualityReadiness: "Quality & Market Readiness",
    digitalPassport: "Digital Craft Passport",
    qrCode: "Product QR Code",
    history: "Product History",
    settings: "Settings",
    uncertainBadge: "UNCERTAIN — Needs Artisan Confirmation",
    offlineNotice: "Working Offline — Changes queued for sync",
    save: "Save & Continue",
    confirm: "Confirm Details"
  },
  hi: {
    welcome: "कलौरा (KALORA) में आपका स्वागत है",
    tagline: "ग्रामीण कारीगरों को डिजिटल कैटलॉग से सशक्त बनाना",
    selectLanguage: "अपनी भाषा चुनें",
    getStarted: "शुरू करें",
    login: "लॉग इन करें",
    register: "नए कारीगर का पंजीकरण करें",
    dashboard: "कारीगर डैशबोर्ड",
    addProduct: "नया उत्पाद जोड़ें",
    voiceInput: "दबाएं और उत्पाद विवरण बोलें",
    cameraUpload: "फोटो खींचें / छवि चुनें",
    processing: "एआई द्वारा उत्पाद विश्लेषण जारी...",
    extractedInfo: "निकाले गए विवरण",
    missingInfo: "कारीगर के लिए प्रश्न",
    catalogPreview: "उत्पाद कैटलॉग पूर्वावलोकन",
    priceAdvisor: "उचित मूल्य सलाहकार",
    qualityReadiness: "गुणवत्ता और बाजार तैयारी",
    digitalPassport: "डिजिटल शिल्प पासपोर्ट",
    qrCode: "उत्पाद क्यूआर कोड",
    history: "उत्पाद इतिहास",
    settings: "सेटिंग्स",
    uncertainBadge: "अनिश्चित — कारीगर की पुष्टि आवश्यक",
    offlineNotice: "ऑफ़लाइन काम कर रहे हैं — बाद में सिंक होगा",
    save: "सहेजें और आगे बढ़ें",
    confirm: "विवरण की पुष्टि करें"
  },
  ta: {
    welcome: "கலோராவிற்கு (KALORA) நல்வரவு",
    tagline: "கிராமப்புற கைவினைஞர்களுக்கு அதிகாரமளித்தல்",
    selectLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    getStarted: "தொடங்குங்கள்",
    dashboard: "கைவினைஞர் டாஷ்போர்டு",
    addProduct: "புதிய தயாரிப்பைச் சேர்க்கவும்",
    voiceInput: "பேசி விவரங்களைப் பதிவுசெய்க",
    save: "சேமிக்கவும்",
    confirm: "உறுதிப்படுத்தவும்"
  },
  bn: {
    welcome: "কালোরায় (KALORA) স্বাগতম",
    tagline: "গ্রামীণ কারিগরদের ডিজিটাল ক্ষমতায়ন",
    selectLanguage: "আপনার ভাষা নির্বাচন করুন",
    getStarted: "শুরু করুন",
    dashboard: "কারিকর ড্যাশবোর্ড",
    addProduct: "নতুন পণ্য যোগ করুন",
    voiceInput: "কথা বলুন এবং তথ্য দিন",
    save: "সংরক্ষণ করুন",
    confirm: "নিশ্চিত করুন"
  }
};

let currentLang = 'en';

export const setLanguage = (lang) => {
  if (TRANSLATIONS[lang]) {
    currentLang = lang;
  }
};

export const t = (key) => {
  const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
  return langDict[key] || TRANSLATIONS['en'][key] || key;
};
