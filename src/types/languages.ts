export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string; // BCP-47 language tag for SpeechRecognition & SpeechSynthesis
  region: string;
  sampleGreeting: string;
  direction?: 'ltr' | 'rtl';
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    region: 'Tamil Nadu & Puducherry',
    sampleGreeting: 'வணக்கம், மருத்துவரின் விளக்கம் உங்கள் தாய்மொழியில்',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    region: 'National / North India',
    sampleGreeting: 'नमस्ते, डॉक्टर की सलाह आपकी मातृभाषा में',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    region: 'Andhra Pradesh & Telangana',
    sampleGreeting: 'నమస్కారం, డాక్టర్ సలహా మీ మాతృభాషలో',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    region: 'Karnataka',
    sampleGreeting: 'ನಮಸ್ಕಾರ, ವೈದ್ಯರ ವಿವರಣೆ ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    region: 'Kerala',
    sampleGreeting: 'നമസ്കാരം, ഡോക്ടറുടെ നിർദ്ദേശം നിങ്ങളുടെ മാതൃഭാഷയിൽ',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    region: 'West Bengal & Tripura',
    sampleGreeting: 'নমস্কার, আপনার মাতৃভাষায় ডাক্তারের পরামর্শ',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    region: 'Maharashtra',
    sampleGreeting: 'नमस्कार, डॉक्टरांचा सल्ला तुमच्या मातृभाषेत',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechCode: 'gu-IN',
    region: 'Gujarat',
    sampleGreeting: 'નમસ્તે, ડૉક્ટરની સલાહ તમારી માતૃભાષામાં',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    speechCode: 'pa-IN',
    region: 'Punjab',
    sampleGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਤੁਹਾਡੀ ਮਾਂ-ਬੋਲੀ ਵਿੱਚ',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'or-IN',
    region: 'Odisha',
    sampleGreeting: 'ନମସ୍କାର, ଆପଣଙ୍କ ମାତୃଭାଷାରେ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    speechCode: 'ur-IN',
    region: 'India-wide / Telangana / J&K',
    sampleGreeting: 'السلام علیکم، ڈاکٹر کی بات آپ کی مادری زبان میں',
    direction: 'rtl',
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    speechCode: 'as-IN',
    region: 'Assam',
    sampleGreeting: 'নমস্কাৰ, আপোনাৰ মাতৃভাষাত চিকিৎসকৰ পৰামৰ্শ',
  },
  {
    code: 'en',
    name: 'English (Indian)',
    nativeName: 'English (Plain)',
    speechCode: 'en-IN',
    region: 'All India',
    sampleGreeting: 'Doctor explanation simplified in simple everyday English',
  },
];
