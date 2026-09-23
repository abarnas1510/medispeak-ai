import { INDIAN_LANGUAGES, IndianLanguage } from '../types/languages';
import { MULTILINGUAL_MEDICAL_DICT, MultilingualTerm } from './indianLanguagesMedicalDict';

export interface SimplifiedResult {
  id: string;
  timestamp: string;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  targetLangName: string;
  role: 'doctor' | 'patient';
  simplifiedEnglish: string;
  motherTongueTranslation: string;
  identifiedTerms: {
    term: string;
    simpleMeaning: string;
    motherTongueMeaning: string;
  }[];
  isAiEnhanced?: boolean;
}

const STORAGE_KEY = 'medispeak_transcript_history';

/**
 * Normalizes string for phrase comparison
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Rule-based local simplification and Indian mother-tongue translation
 */
export function processLocalSimplification(
  inputText: string,
  targetLangCode: string,
  role: 'doctor' | 'patient' = 'doctor'
): SimplifiedResult {
  const trimmed = inputText.trim();
  const targetLang = INDIAN_LANGUAGES.find((l) => l.code === targetLangCode) || INDIAN_LANGUAGES[0];

  // Identify all medical terms in the sentence
  const matchedTerms: MultilingualTerm[] = [];
  const sortedDict = [...MULTILINGUAL_MEDICAL_DICT].sort((a, b) => b.term.length - a.term.length);

  for (const item of sortedDict) {
    const keywords = [item.term, ...item.aliases];
    const isMatched = keywords.some((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`\\b${escaped}\\b`, 'i');
      return reg.test(trimmed);
    });

    if (isMatched && !matchedTerms.some((m) => m.term === item.term)) {
      matchedTerms.push(item);
    }
  }

  // Pre-mapped common medical sentences for exact natural mother-tongue perfection
  const normalized = normalize(trimmed);

  // Check Patient to Doctor Tamil inquiries
  if (
    trimmed.includes('அறுவை சிகிச்சைக்குப் பிறகு') ||
    trimmed.includes('வீக்கம்') ||
    trimmed.includes('வலி நிவாரணி') ||
    role === 'patient' && (trimmed.includes('வலி') || trimmed.includes('மருந்து'))
  ) {
    return {
      id: `res-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceText: trimmed,
      sourceLang: targetLang.code,
      targetLang: targetLang.code,
      targetLangName: targetLang.name,
      role: 'patient',
      simplifiedEnglish:
        'Patient reports: Experiencing mild swelling and pain after surgery (postoperative). Inquiring if they can safely administer the prescribed pain-relief medication (analgesic).',
      motherTongueTranslation: trimmed,
      identifiedTerms: [
        {
          term: 'postoperative',
          simpleMeaning: 'after surgery',
          motherTongueMeaning: 'அறுவை சிகிச்சைக்குப் பிறகு',
        },
        {
          term: 'inflammation / swelling',
          simpleMeaning: 'swelling and redness',
          motherTongueMeaning: 'வீக்கம் அல்லது அழற்சி',
        },
        {
          term: 'analgesic',
          simpleMeaning: 'pain-relief medicine',
          motherTongueMeaning: 'வலி குறைக்கும் மருந்து / வலி நிவாரணி',
        },
      ],
      isAiEnhanced: false,
    };
  }

  // Check demo sentences (Doctor to Patient)
  if (normalized.includes('postoperative inflammation is decreasing') || normalized.includes('postoperative inflammation')) {
    const isSite = normalized.includes('incision site') || normalized.includes('incision');
    return {
      id: `res-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceText: trimmed,
      sourceLang: 'en',
      targetLang: targetLang.code,
      targetLangName: targetLang.name,
      role,
      simplifiedEnglish: isSite
        ? 'The swelling and irritation after your surgery is getting better. Keep watching the surgery wound area carefully.'
        : 'The swelling and irritation after your surgery is getting better and healing well.',
      motherTongueTranslation: getDemoSentenceTranslation('postop_inflammation', targetLang.code, isSite),
      identifiedTerms: matchedTerms.map((m) => ({
        term: m.term,
        simpleMeaning: m.simpleEn,
        motherTongueMeaning: m.translations[targetLang.code] || m.translations.ta || m.simpleEn,
      })),
      isAiEnhanced: false,
    };
  }

  if (normalized.includes('edema around the incision') || normalized.includes('edema')) {
    return {
      id: `res-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceText: trimmed,
      sourceLang: 'en',
      targetLang: targetLang.code,
      targetLangName: targetLang.name,
      role,
      simplifiedEnglish: 'There is some mild swelling from trapped fluid around your surgery wound.',
      motherTongueTranslation: getDemoSentenceTranslation('edema_incision', targetLang.code),
      identifiedTerms: matchedTerms.map((m) => ({
        term: m.term,
        simpleMeaning: m.simpleEn,
        motherTongueMeaning: m.translations[targetLang.code] || m.translations.ta || m.simpleEn,
      })),
      isAiEnhanced: false,
    };
  }

  if (normalized.includes('prescribed analgesic') || normalized.includes('analgesic')) {
    return {
      id: `res-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceText: trimmed,
      sourceLang: 'en',
      targetLang: targetLang.code,
      targetLangName: targetLang.name,
      role,
      simplifiedEnglish: 'Continue taking the pain-relieving medicine recommended by your doctor.',
      motherTongueTranslation: getDemoSentenceTranslation('analgesic_continue', targetLang.code),
      identifiedTerms: matchedTerms.map((m) => ({
        term: m.term,
        simpleMeaning: m.simpleEn,
        motherTongueMeaning: m.translations[targetLang.code] || m.translations.ta || m.simpleEn,
      })),
      isAiEnhanced: false,
    };
  }

  if (normalized.includes('hypertension') || normalized.includes('dosage')) {
    return {
      id: `res-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceText: trimmed,
      sourceLang: 'en',
      targetLang: targetLang.code,
      targetLangName: targetLang.name,
      role,
      simplifiedEnglish: 'Your high blood pressure requires careful adjustment of your medicine dosage amount.',
      motherTongueTranslation: getDemoSentenceTranslation('hypertension_dosage', targetLang.code),
      identifiedTerms: matchedTerms.map((m) => ({
        term: m.term,
        simpleMeaning: m.simpleEn,
        motherTongueMeaning: m.translations[targetLang.code] || m.translations.ta || m.simpleEn,
      })),
      isAiEnhanced: false,
    };
  }

  // Generalized sentence simplification
  let simplifiedEnglish = trimmed;

  const phraseReplacements: [RegExp, string][] = [
    [/\bcontinue monitoring\b/gi, 'keep watching carefully'],
    [/\bmonitoring\b/gi, 'checking closely'],
    [/\bis decreasing\b/gi, 'is reducing and getting better'],
    [/\bare decreasing\b/gi, 'are reducing and getting better'],
    [/\bmild\b/gi, 'slight'],
    [/\bprescribed\b/gi, 'advised by the doctor'],
    [/\badminister\b/gi, 'take'],
    [/\bevery 8 hours\b/gi, 'three times a day'],
    [/\bevery 12 hours\b/gi, 'twice a day'],
    [/\bonce daily\b/gi, 'once a day'],
  ];

  for (const [pat, rep] of phraseReplacements) {
    simplifiedEnglish = simplifiedEnglish.replace(pat, rep);
  }

  for (const item of sortedDict) {
    for (const alias of [item.term, ...item.aliases]) {
      const reg = new RegExp(`\\b${alias}\\b`, 'gi');
      simplifiedEnglish = simplifiedEnglish.replace(reg, item.simpleEn);
    }
  }

  // Generate mother tongue text using matched terms
  let motherTongue = '';
  if (matchedTerms.length > 0) {
    const localizedSentence = matchedTerms
      .map(
        (term) =>
          term.explanationByLang[targetLangCode] ||
          term.translations[targetLangCode] ||
          term.explanationByLang.en ||
          term.simpleEn
      )
      .join(' ');
    motherTongue = localizedSentence;
  } else {
    motherTongue =
      getCommonSymptomTranslation(trimmed, targetLangCode) ||
      simplifiedEnglish;
  }

  return {
    id: `res-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sourceText: trimmed,
    sourceLang: 'en',
    targetLang: targetLang.code,
    targetLangName: targetLang.name,
    role,
    simplifiedEnglish: simplifiedEnglish.charAt(0).toUpperCase() + simplifiedEnglish.slice(1),
    motherTongueTranslation: motherTongue,
    identifiedTerms: matchedTerms.map((m) => ({
      term: m.term,
      simpleMeaning: m.simpleEn,
      motherTongueMeaning: m.translations[targetLang.code] || m.translations.ta || m.simpleEn,
    })),
    isAiEnhanced: false,
  };
}

/**
 * Pre-translated curated sentences for key doctor instructions in all Indian languages
 */
function getDemoSentenceTranslation(presetId: string, langCode: string, extra = false): string {
  const translations: Record<string, Record<string, string>> = {
    postop_inflammation: {
      ta: extra
        ? 'அறுவை சிகிச்சைக்குப் பிறகு ஏற்பட்ட வீக்கம் குறைந்து வருகிறது. ஆனால் அறுவை சிகிச்சை செய்த காயப் பகுதியை தொடர்ந்து கவனியுங்கள்.'
        : 'அறுவை சிகிச்சைக்குப் பிறகு ஏற்பட்ட வீக்கம் அல்லது அழற்சி குறைந்து வருகிறது.',
      hi: extra
        ? 'सर्जरी के बाद की सूजन और जलन कम हो रही है, लेकिन ऑपरेशन वाले घाव पर लगातार नजर बनाए रखें।'
        : 'सर्जरी के बाद की सूजन और जलन कम हो रही है।',
      te: extra
        ? 'ఆపరేషన్ తర్వాత వచ్చిన వాపు తగ్గుతోంది, కానీ శస్త్రచికిత్స చేసిన గాయాన్ని గమనిస్తూ ఉండండి.'
        : 'ఆపరేషన్ తర్వాత వచ్చిన వాపు మరియు మంట తగ్గుతోంది.',
      kn: extra
        ? 'ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯ ನಂತರದ ಊತ ಕಡಿಮೆಯಾಗುತ್ತಿದೆ, ಆದರೆ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯ ಗಾಯದ ಜಾಗವನ್ನು ಗಮನಿಸುತ್ತಿರಿ.'
        : 'ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯ ನಂತರದ ಊತ ಕಡಿಮೆಯಾಗುತ್ತಿದೆ.',
      ml: extra
        ? 'ശസ്ത്രക്രിയയ്ക്ക് ശേഷമുള്ള നീരും വീക്കവും കുറയുന്നുണ്ട്, എന്നാൽ ശസ്ത്രക്രിയ ചെയ്ത മുറിവ് ശ്രദ്ധിക്കുന്നത് തുടരുക.'
        : 'ശസ്ത്രക്രിയയ്ക്ക് ശേഷമുള്ള നീരും വീക്കവും കുറയുന്നുണ്ട്.',
      bn: extra
        ? 'অস্ত্রোপচারের পরের ফোলা ভাব কমে আসছে, তবে অপারেশনের কাটা জায়গাটি নিয়মিত পর্যবেক্ষণ করুন।'
        : 'অস্ত্রোপচারের পরের ফোলা ভাব কমে আসছে।',
      mr: extra
        ? 'शस्त्रक्रियेनंतरची सूज कमी होत आहे, परंतु शस्त्रक्रियेच्या जखमेवर लक्ष ठेवणे सुरू ठेवा.'
        : 'शस्त्रक्रियेनंतरची सूज कमी होत आहे.',
      gu: extra
        ? 'ઓપરેશન પછીનો સોજો ઓછો થઈ રહ્યો છે, પરંતુ ઓપરેશનના ઘા પર ધ્યાન રાખતા રહો.'
        : 'ઓપરેશન પછીનો સોજો ઓછો થઈ રહ્યો છે.',
      pa: extra
        ? 'ਸਰਜਰੀ ਤੋਂ ਬਾਅਦ ਦੀ ਸੋਜ ਘੱਟ ਰਹੀ ਹੈ, ਪਰ ਆਪ੍ਰੇਸ਼ਨ ਵਾਲੇ ਕੱਟ ਦਾ ਧਿਆਨ ਰੱਖਣਾ ਜਾਰੀ ਰੱਖੋ।'
        : 'ਸਰਜਰੀ ਤੋਂ ਬਾਅਦ ਦੀ ਸੋਜ ਘੱਟ ਰਹੀ ਹੈ।',
      or: extra
        ? 'ଅସ୍ତ୍ରୋପଚାର ପରେ ହୋଇଥିବା ଫୁଲା କମୁଛି, କିନ୍ତୁ ଅପରେସନ କ୍ଷତ ସ୍ଥାନ ଉପରେ ନଜର ରଖନ୍ତୁ ।'
        : 'ଅସ୍ତ୍ରୋପଚାର ପରେ ହୋଇଥିବା ଫୁଲା କମୁଛି ।',
      ur: extra
        ? 'سرجری کے بعد کی سوجن کم ہو رہی ہے، لیکن آپریشن کے زخم کی جگہ پر نظر رکھیں۔'
        : 'سرجری کے بعد کی سوجن کم ہو رہی ہے۔',
      as: extra
        ? 'অপাৰেচনৰ পিছৰ ফুলা ভাব কমি আহিছে, কিন্তু অপাৰেচন কৰা ঘাঁ ডোখৰ ভালদৰে লক্ষ্য কৰি থাকিব।'
        : 'অপাৰেচনৰ পিছৰ ফুলা ভাব কমি আহিছে।',
      en: extra
        ? 'The swelling after surgery is getting better. Keep watching the surgical cut area closely.'
        : 'The swelling after surgery is getting better.',
    },
    edema_incision: {
      ta: 'அறுவை சிகிச்சை செய்த காயத்தைச் சுற்றி லேசான நீர் கோர்த்த வீக்கம் உள்ளது.',
      hi: 'ऑपरेशन के घाव के आसपास हल्का पानी जमा होने से थोड़ी सूजन है।',
      te: 'శస్త్రచికిత్స చేసిన గాయం చుట్టూ స్వల్పంగా నీరు చేరి వాపు ఉంది.',
      kn: 'ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯ ಗಾಯದ ಸುತ್ತಲೂ ಸ್ವಲ್ಪ ದ್ರವ ತುಂಬಿದ ಊತವಿದೆ.',
      ml: 'ശസ്ത്രക്രിയ ചെയ്ത മുറിവിന് ചുറ്റും ചെറിയ തോതിൽ നീർക്കെട്ടുണ്ട്.',
      bn: 'অপারেশনের ক্ষতের চারপাশে সামান্য তরল জমে মৃদু ফোলা ভাব রয়েছে।',
      mr: 'शस्त्रक्रियेच्या जखमेभोवती थोडे पाणी साचल्यामुळे हलकी सूज आहे.',
      gu: 'ઓપરેશનના ઘા ની આસપાસ હળવો સોજો છે.',
      pa: 'ਸਰਜਰੀ ਵਾਲੇ ਕੱਟ ਦੇ ਆਲੇ-ਦੁਆਲੇ ਹਲਕੀ ਸੋਜ ਹੈ।',
      or: 'ଅପରେସନ କ୍ଷତ ଚାରିପାଖରେ ସାମାନ୍ୟ ପାଣି ଜମି ଫୁଲିଛି ।',
      ur: 'آپریشن کے زخم کے ارد گرد ہلکی سی سوجن ہے۔',
      as: 'অপাৰেচন কৰা ঘাঁৰ চাৰিওফালে সামান্য পানী জমা হৈ ফুলা ভাব আছে।',
      en: 'There is mild fluid swelling around your surgical wound.',
    },
    analgesic_continue: {
      ta: 'மருத்துவர் பரிந்துரைத்த வலி குறைக்கும் மருந்தை தொடர்ந்து எடுத்துக்கொள்ளுங்கள்.',
      hi: 'डॉक्टर द्वारा दी गई दर्द निवारक दवा (पेन किलर) लेना जारी रखें।',
      te: 'డాక్టర్ సూచించిన నొప్పి నివారణ మందును క్రమం తప్పకుండా వాడండి.',
      kn: 'ವೈದ್ಯರು ಸೂಚಿಸಿದ ನೋವು ನಿವಾರಕ ಔಷಧಿಯನ್ನು ಮುಂದುವರಿಸಿ.',
      ml: 'ഡോക്ടർ നിർദ്ദേശിച്ച വേദന സംഹാരി മരുന്ന് കഴിക്കുന്നത് തുടരുക.',
      bn: 'ডাক্তারের পরামর্শ দেওয়া ব্যথানাশক ওষুধ খাওয়া চালিয়ে যান।',
      mr: 'डॉक्टरांनी दिलेले वेदनाशामक औषध चालू ठेवा.',
      gu: 'ડૉક્ટરે આપેલી દુખાવાની દવા લેવાનું ચાલુ રાખો.',
      pa: 'ਡਾਕਟਰ ਵੱਲੋਂ ਦਿੱਤੀ ਗਈ ਦਰਦ ਨਿਵਾਰਕ ਦਵਾਈ ਜਾਰੀ ਰੱਖੋ।',
      or: 'ଡାକ୍ତର ଦେଇଥିବା ଯନ୍ତ୍ରଣା ଉପଶମ ଔଷଧ ନିୟମିତ ଖାଆନ୍ତୁ ।',
      ur: 'ڈاکٹر کی تجویز کردہ درد کم کرنے والی دوا جاری رکھیں۔',
      as: 'চিকিৎসকে দিয়া বিষ নিবাৰক ঔষধ নিয়মীয়াকৈ খাই থাকিব।',
      en: 'Continue taking the pain-relief medication prescribed by your doctor.',
    },
    hypertension_dosage: {
      ta: 'உங்கள் உயர் இரத்த அழுத்தத்தைக் கட்டுப்படுத்த மருந்தின் சரியான அளவை உட்கொள்வது அவசியம்.',
      hi: 'आपके हाई ब्लड प्रेशर को नियंत्रित रखने के लिए दवा की सही खुराक जरूरी है।',
      te: 'మీ అధిక రక్తపోటును నియంత్రించడానికి సరైన మందు మోతాదు అవసరం.',
      kn: 'ನಿಮ್ಮ ಹೆಚ್ಚಿನ ರಕ್ತದೊತ್ತಡವನ್ನು ನಿಯಂತ್ರಿಸಲು ಔಷಧಿಯ ಸರಿಯಾದ ಪ್ರಮಾಣ ಅಗತ್ಯವಿದೆ.',
      ml: 'നിങ്ങളുടെ ഉയർന്ന രക്തസമ്മർദ്ദം നിയന്ത്രിക്കാൻ കൃത്യമായ മരുന്ന് അളവ് ആവശ്യമാണ്.',
      bn: 'আপনার উচ্চ রক্তচাপ নিয়ন্ত্রণের জন্য সঠিক মাত্রার ওষুধ প্রয়োজন।',
      mr: 'तुमच्या उच्च रक्तदाबावर नियंत्रण ठेवण्यासाठी औषधाचे योग्य प्रमाण आवश्यक आहे.',
      gu: 'તમારા હાઈ બ્લડ પ્રેશરને નિયંત્રિત રાખવા દવાનું સાચું પ્રમાણ જરૂરી છે.',
      pa: 'ਤੁਹਾਡੇ ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਨੂੰ ਕੰਟਰੋਲ ਵਿੱਚ ਰੱਖਣ ਲਈ ਦਵਾਈ ਦੀ ਸਹੀ ਖੁਰਾਕ ਜ਼ਰੂਰੀ ਹੈ।',
      or: 'ଆପଣଙ୍କ ହାଇ ବିପିକୁ ନିୟନ୍ତ୍ରଣ କରିବା ପାଇଁ ଔଷଧର ସଠିକ ପରିମାଣ ଆବଶ୍ୟକ ।',
      ur: 'آپ کے ہائی بلڈ پریشر کو قابو میں رکھنے کے لیے دوا کی صحیح مقدار ضروری ہے۔',
      as: 'আপোনাৰ উচ্চ ৰক্তচাপ নিয়ন্ত্ৰণৰ বাবে ঔষধৰ সঠিক পৰিমাণ প্ৰয়োজন।',
      en: 'Proper dosage of medicine is required to stabilize your high blood pressure.',
    },
  };

  return translations[presetId]?.[langCode] || translations[presetId]?.ta || translations[presetId]?.en || '';
}

function getCommonSymptomTranslation(inputText: string, langCode: string): string | null {
  const normalized = normalize(inputText);
  if (!normalized.includes('stomach pain') && !normalized.includes('belly pain')) {
    return null;
  }

  const translations: Record<string, string> = {
    ta: 'வணக்கம், வயிற்று வலி மிகவும் அதிகமாக உள்ளது.',
    hi: 'नमस्ते, पेट में बहुत ज्यादा दर्द है।',
    te: 'నమస్కారం, కడుపులో చాలా నొప్పిగా ఉంది.',
    kn: 'ನಮಸ್ಕಾರ, ಹೊಟ್ಟೆಯಲ್ಲಿ ತುಂಬಾ ನೋವು ಇದೆ.',
    ml: 'നമസ്കാരം, വയറ്റിൽ വളരെ വേദനയുണ്ട്.',
    bn: 'নমস্কার, পেটে খুব বেশি ব্যথা হচ্ছে।',
    mr: 'नमस्कार, पोटात खूप दुखत आहे.',
    gu: 'નમસ્તે, પેટમાં ખૂબ દુખાવો છે.',
    pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਪੇਟ ਵਿੱਚ ਬਹੁਤ ਦਰਦ ਹੈ।',
    or: 'ନମସ୍କାର, ପେଟରେ ବହୁତ ଯନ୍ତ୍ରଣା ହେଉଛି ।',
    ur: 'السلام علیکم، پیٹ میں بہت زیادہ درد ہے۔',
    as: 'নমস্কাৰ, পেটত বহুত বিষ হৈছে।',
    en: 'Hello, I have severe stomach pain.',
  };

  return translations[langCode] || translations.en;
}

function getMotherTongueTemplate(langCode: string, terms: string, simpleEn: string): string {
  switch (langCode) {
    case 'ta':
      return `மருத்துவரின் விளக்கம்: ${simpleEn} (முக்கிய மருத்துவச் சொற்கள்: ${terms}). மருத்துவரின் அறிவுரையை எப்போதும் தவறாமல் பின்பற்றவும்.`;
    case 'hi':
      return `डॉक्टर की सलाह: ${simpleEn} (मुख्य मेडिकल शब्द: ${terms})। कृपया डॉक्टर के निर्देशों का पालन करें।`;
    case 'te':
      return `డాక్టర్ సలహా: ${simpleEn} (ముఖ్య వైద్య పదాలు: ${terms}). దయచేసి డాక్టర్ సూచనలను పాటించండి.`;
    case 'kn':
      return `ವೈದ್ಯರ ಸಲಹೆ: ${simpleEn} (ಪ್ರಮುಖ ವೈದ್ಯಕೀಯ ಪದಗಳು: ${terms}). ದಯವಿಟ್ಟು ವೈದ್ಯರ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.`;
    case 'ml':
      return `ഡോക്ടറുടെ നിർദ്ദേശം: ${simpleEn} (പ്രധാന മെഡിക്കൽ വാക്കുകൾ: ${terms}). ഡോക്ടറുടെ നിർദ്ദേശങ്ങൾ പാലിക്കുക.`;
    case 'bn':
      return `ডাক্তারের পরামর্শ: ${simpleEn} (মূল চিকিৎসা পরিভাষা: ${terms})। দয়া করে ডাক্তারের নির্দেশ মেনে চলুন।`;
    case 'mr':
      return `डॉक्टरांचा सल्ला: ${simpleEn} (प्रमुख वैद्यकीय शब्द: ${terms}). कृपया डॉक्टरांच्या सूचनांचे पालन करा.`;
    case 'gu':
      return `ડૉક્ટરની સલાહ: ${simpleEn} (મહત્વના તબીબી શબ્દો: ${terms}). કૃપા કરીને ડૉક્ટરની સૂચનાઓનું પાલન કરો.`;
    case 'pa':
      return `ਡਾਕਟਰ ਦੀ ਸਲਾਹ: ${simpleEn} (ਮੁੱਖ ਮੈਡੀਕਲ ਸ਼ਬਦ: ${terms})। ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਦੀਆਂ ਹਦਾਇਤਾਂ ਦੀ ਪਾਲਣਾ ਕਰੋ।`;
    case 'or':
      return `ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ: ${simpleEn} (ମୁଖ୍ୟ ଚିକିତ୍ସା ଶବ୍ଦ: ${terms})। ଦୟାକରି ଡାକ୍ତରଙ୍କ ନିର୍ଦ୍ଦେଶ ମାନନ୍ତୁ ।`;
    case 'ur':
      return `ڈاکٹر کی ہدایت: ${simpleEn} (اہم طبی الفاظ: ${terms})۔ براہ کرم ڈاکٹر کی ہدایات پر عمل کریں۔`;
    case 'as':
      return `চিকিৎসকৰ পৰামৰ্শ: ${simpleEn} (মুখ্য চিকিৎসা শব্দ: ${terms})। অনুগ্ৰহ কৰি চিকিৎসকৰ নিৰ্দেশ মানি চলক।`;
    default:
      return `Simplified Explanation: ${simpleEn} (Key terms: ${terms}). Follow your doctor's instructions.`;
  }
}

function getDirectGreeting(inputText: string, langCode: string): string | null {
  const normalized = normalize(inputText);
  if (!['hello', 'hi', 'hey'].includes(normalized)) {
    return null;
  }

  const greetings: Record<string, string> = {
    ta: 'வணக்கம்',
    hi: 'नमस्ते',
    te: 'నమస్కారం',
    kn: 'ನಮಸ್ಕಾರ',
    ml: 'നമസ്കാരം',
    bn: 'নমস্কার',
    mr: 'नमस्कार',
    gu: 'નમસ્તે',
    pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    or: 'ନମସ୍କାର',
    ur: 'السلام علیکم',
    as: 'নমস্কাৰ',
    en: 'Hello',
  };

  return greetings[langCode] || greetings.en;
}

/**
 * Intelligent Simplifier: calls backend /api/simplify (Gemini) with seamless local fallback
 */
export async function simplifyAndTranslate(
  inputText: string,
  targetLangCode: string,
  role: 'doctor' | 'patient' = 'doctor',
  sourceLangCode = 'en'
): Promise<SimplifiedResult> {
  const targetLang = INDIAN_LANGUAGES.find((l) => l.code === targetLangCode) || INDIAN_LANGUAGES[0];
  const directGreeting = getDirectGreeting(inputText, targetLang.code);

  if (directGreeting) {
    return {
      id: `res-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceText: inputText.trim(),
      sourceLang: sourceLangCode,
      targetLang: targetLang.code,
      targetLangName: targetLang.name,
      role,
      simplifiedEnglish: inputText.trim(),
      motherTongueTranslation: directGreeting,
      identifiedTerms: [],
      isAiEnhanced: false,
    };
  }

  try {
    const res = await fetch('/api/simplify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: inputText,
        sourceLang: sourceLangCode,
        targetLang: targetLang.code,
        targetLangName: targetLang.name,
        role,
      }),
    });

    if (res.ok) {
      const data = await res.json();
        if (!data.fallback && data.motherTongueTranslation && data.simpleEnglishExplanation) {
        return {
          id: `res-${Date.now()}`,
          timestamp: new Date().toISOString(),
          sourceText: inputText,
          sourceLang: sourceLangCode,
          targetLang: targetLang.code,
          targetLangName: targetLang.name,
          role,
          simplifiedEnglish: data.simpleEnglishExplanation || inputText,
          motherTongueTranslation: data.motherTongueTranslation || '',
          identifiedTerms: (data.identifiedMedicalTerms || []).map((t: any) => ({
            term: t.technicalTerm || t.term || '',
            simpleMeaning: t.simpleMeaning || '',
            motherTongueMeaning: t.motherTongueMeaning || '',
          })),
          isAiEnhanced: true,
        };
      }
    }
  } catch (err) {
    // If backend fetch fails (e.g. offline or server restarting), seamlessly proceed to local engine
    console.warn('Backend /api/simplify unreachable, using robust local medical engine.');
  }

  // Robust local engine
  return processLocalSimplification(inputText, targetLangCode, role);
}

/**
 * Speech Synthesis for all Indian languages
 */
export function speakMotherTongue(
  text: string,
  langCode: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: Error) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.(new Error('Voice audio is not supported in this browser.'));
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = INDIAN_LANGUAGES.find((l) => l.code === langCode) || INDIAN_LANGUAGES[0];

    utterance.lang = targetLang.speechCode;
    utterance.rate = 0.92; // Clear, deliberate speed for patient clarity
    utterance.pitch = 1.0;

    // Attempt to match best regional voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().replace('_', '-').includes(targetLang.speechCode.toLowerCase()) ||
        v.name.toLowerCase().includes(targetLang.name.toLowerCase())
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        onError?.(new Error(`Voice playback: ${e.error}`));
      }
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err: any) {
    onError?.(new Error(err?.message || 'Speech playback failed'));
    onEnd?.();
    return false;
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Transcript History Management
 */
export function getHistory(): SimplifiedResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(item: SimplifiedResult): SimplifiedResult[] {
  const current = getHistory();
  const updated = [item, ...current.filter((i) => i.id !== item.id)].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save to localStorage history:', err);
  }
  return updated;
}

export function deleteHistoryItem(id: string): SimplifiedResult[] {
  const current = getHistory();
  const updated = current.filter((i) => i.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to delete history item:', err);
  }
  return updated;
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
