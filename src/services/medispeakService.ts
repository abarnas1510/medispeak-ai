/**
 * CareBridge - MediSpeak AI Core Logic & Medical Dictionary
 * 
 * Medical Disclaimer:
 * MediSpeak AI simplifies medical terminology for patient understanding.
 * It does NOT provide medical diagnosis, prescribe medicines, or change treatment.
 */

export interface MedicalTerm {
  term: string;
  aliases: string[];
  simpleEn: string;
  simpleTa: string;
  definition: string;
  category: 'surgical' | 'medication' | 'symptom' | 'condition' | 'procedure';
}

export interface DemoSentence {
  id: string;
  title: string;
  doctorStatement: string;
  simpleExplanation: string;
  tamilExplanation: string;
  highlightTerms: string[];
}

export interface MediSpeakResult {
  originalText: string;
  simpleExplanation: string;
  tamilExplanation: string;
  identifiedTerms: MedicalTerm[];
  hasRecognizedTerms: boolean;
  statusMessage?: string;
}

export interface MediSpeakHistoryRecord {
  id: string;
  patientId: string;
  originalStatement: string;
  simpleExplanation: string;
  tamilExplanation?: string;
  selectedLanguage: 'en' | 'ta';
  timestamp: string;
  terms: string[];
}

export const MEDICAL_DICTIONARY: MedicalTerm[] = [
  {
    term: 'postoperative',
    aliases: ['post-operative', 'post operative', 'post-op', 'postop'],
    simpleEn: 'after your surgery',
    simpleTa: 'அறுவை சிகிச்சைக்குப் பிறகு',
    definition: 'Happening or given after a surgical operation.',
    category: 'surgical',
  },
  {
    term: 'inflammation',
    aliases: ['inflamed', 'inflammatory'],
    simpleEn: 'swelling or irritation in the body',
    simpleTa: 'வீக்கம் அல்லது அழற்சி',
    definition: 'Swelling, redness, and heat caused by the body healing or fighting injury.',
    category: 'symptom',
  },
  {
    term: 'incision site',
    aliases: ['incision area', 'surgical site'],
    simpleEn: 'the surgery wound area',
    simpleTa: 'அறுவை சிகிச்சை செய்த காயப் பகுதி',
    definition: 'The specific cut made in the skin and tissue during an operation.',
    category: 'surgical',
  },
  {
    term: 'incision',
    aliases: ['incisions'],
    simpleEn: 'the cut made during surgery',
    simpleTa: 'அறுவை சிகிச்சை காயம் / வெட்டு',
    definition: 'A surgical cut in skin or flesh during a procedure.',
    category: 'surgical',
  },
  {
    term: 'analgesic',
    aliases: ['analgesics', 'painkiller'],
    simpleEn: 'pain-relieving medicine',
    simpleTa: 'வலி குறைக்கும் மருந்து',
    definition: 'Medication specially prescribed to soothe or eliminate pain.',
    category: 'medication',
  },
  {
    term: 'hypertension',
    aliases: ['hypertensive'],
    simpleEn: 'high blood pressure',
    simpleTa: 'உயர் இரத்த அழுத்தம்',
    definition: 'Blood pressure that stays consistently higher than the normal healthy range.',
    category: 'condition',
  },
  {
    term: 'hypotension',
    aliases: ['hypotensive'],
    simpleEn: 'low blood pressure',
    simpleTa: 'குறைந்த இரத்த அழுத்தம்',
    definition: 'Blood pressure that drops below the normal range.',
    category: 'condition',
  },
  {
    term: 'edema',
    aliases: ['oedema', 'edematous'],
    simpleEn: 'swelling caused by extra fluid',
    simpleTa: 'நீர் கோர்த்த வீக்கம்',
    definition: 'Puffiness or swelling caused by fluid trapped in your body tissues.',
    category: 'symptom',
  },
  {
    term: 'infection',
    aliases: ['infectious', 'infected'],
    simpleEn: 'germs or bacteria causing sickness in the body',
    simpleTa: 'கிருமித் தொற்று',
    definition: 'Invasion and growth of germs in body tissues.',
    category: 'condition',
  },
  {
    term: 'antibiotic',
    aliases: ['antibiotics'],
    simpleEn: 'germ-fighting medicine',
    simpleTa: 'நுண்ணுயிர் எதிர்ப்பு மருந்து',
    definition: 'Prescription medicine used to fight and kill bacterial infections.',
    category: 'medication',
  },
  {
    term: 'dosage',
    aliases: ['dose', 'dosages'],
    simpleEn: 'the exact amount and schedule of medicine to take',
    simpleTa: 'மருந்தின் அளவு மற்றும் நேரம்',
    definition: 'The specific size, frequency, and duration of medication.',
    category: 'medication',
  },
  {
    term: 'diagnosis',
    aliases: ['diagnoses', 'diagnosed'],
    simpleEn: 'identifying what medical condition you have',
    simpleTa: 'நோயைக் கண்டறிதல்',
    definition: 'The identification of a medical condition or illness by a doctor.',
    category: 'procedure',
  },
  {
    term: 'symptom',
    aliases: ['symptoms', 'symptomatic'],
    simpleEn: 'a physical feeling or sign of a health issue (like fever or pain)',
    simpleTa: 'நோய் அறிகுறி',
    definition: 'A physical or mental feeling indicating an underlying condition.',
    category: 'symptom',
  },
  {
    term: 'prognosis',
    aliases: ['prognoses'],
    simpleEn: "the doctor's forecast of how you are likely to recover",
    simpleTa: 'குணமடைவதற்கான வாய்ப்பு / கணிப்பு',
    definition: 'The expected outcome and timeline of recovery from an illness.',
    category: 'procedure',
  },
  {
    term: 'anesthesia',
    aliases: ['anaesthesia', 'anesthetic', 'anaesthetic'],
    simpleEn: 'medicine given to prevent feeling pain during procedures',
    simpleTa: 'மயக்க மருந்து',
    definition: 'Medication that prevents you from feeling pain during an operation.',
    category: 'procedure',
  },
];

export const DEMO_SENTENCES: DemoSentence[] = [
  {
    id: 'demo-1',
    title: 'Post-Surgery Checkup',
    doctorStatement: 'Your postoperative inflammation is decreasing, but continue monitoring the incision site.',
    simpleExplanation: 'The swelling or irritation after your surgery is getting better. Keep watching the surgery wound area.',
    tamilExplanation: 'அறுவை சிகிச்சைக்குப் பிறகு ஏற்பட்ட வீக்கம் அல்லது எரிச்சல் குறைந்து வருகிறது. அறுவை சிகிச்சை செய்த காயத்தை தொடர்ந்து கவனியுங்கள்.',
    highlightTerms: ['postoperative', 'inflammation', 'incision site'],
  },
  {
    id: 'demo-2',
    title: 'Wound Swelling Assessment',
    doctorStatement: 'You have mild edema around the incision.',
    simpleExplanation: 'There is some mild swelling around the surgery wound.',
    tamilExplanation: 'அறுவை சிகிச்சை செய்த காயத்தைச் சுற்றி லேசான வீக்கம் உள்ளது.',
    highlightTerms: ['edema', 'incision'],
  },
  {
    id: 'demo-3',
    title: 'Pain Medication Advice',
    doctorStatement: 'Continue your prescribed analgesic.',
    simpleExplanation: 'Continue taking the pain-relieving medicine prescribed by your doctor.',
    tamilExplanation: 'மருத்துவர் பரிந்துரைத்த வலி குறைக்கும் மருந்தை தொடர்ந்து எடுத்துக்கொள்ளுங்கள்.',
    highlightTerms: ['analgesic'],
  },
  {
    id: 'demo-4',
    title: 'Blood Pressure & Dosage Review',
    doctorStatement: 'Your hypertension requires a lower dosage of the medication.',
    simpleExplanation: 'Your high blood pressure requires a smaller amount of the medicine.',
    tamilExplanation: 'உங்கள் உயர் இரத்த அழுத்தத்திற்கு குறைந்த அளவு மருந்து தேவைப்படுகிறது.',
    highlightTerms: ['hypertension', 'dosage'],
  },
  {
    id: 'demo-5',
    title: 'Infection Treatment',
    doctorStatement: 'Take the full course of your antibiotic to treat the infection.',
    simpleExplanation: 'Take all of your germ-fighting medicine to clear the germs causing sickness in your body.',
    tamilExplanation: 'கிருமித் தொற்றைக் குணப்படுத்த உங்கள் நுண்ணுயிர் எதிர்ப்பு மருந்துகளை முழுமையாக எடுத்துக் கொள்ளுங்கள்.',
    highlightTerms: ['antibiotic', 'infection'],
  },
];

const STORAGE_KEY = 'carebridge_medispeak_history';

/**
 * Normalizes text for comparison (removes trailing punctuation and normalizes spaces)
 */
function normalizeString(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * MediSpeak AI simplification engine
 */
export function simplifyDoctorStatement(inputText: string): MediSpeakResult {
  const trimmed = inputText.trim();
  if (!trimmed) {
    return {
      originalText: '',
      simpleExplanation: '',
      tamilExplanation: '',
      identifiedTerms: [],
      hasRecognizedTerms: false,
      statusMessage: 'Please enter or record a statement from your doctor.',
    };
  }

  const normalizedInput = normalizeString(trimmed);

  // 1. Check for curated demo sentence matches
  for (const demo of DEMO_SENTENCES) {
    const normalizedDemo = normalizeString(demo.doctorStatement);
    if (normalizedInput === normalizedDemo || normalizedInput.includes(normalizedDemo) || normalizedDemo.includes(normalizedInput)) {
      const matchedTerms = MEDICAL_DICTIONARY.filter((item) =>
        demo.highlightTerms.some((t) => t.toLowerCase() === item.term.toLowerCase())
      );
      return {
        originalText: trimmed,
        simpleExplanation: demo.simpleExplanation,
        tamilExplanation: demo.tamilExplanation,
        identifiedTerms: matchedTerms,
        hasRecognizedTerms: true,
      };
    }
  }

  // Check specific variations like "Your postoperative inflammation is decreasing."
  if (normalizedInput === 'your postoperative inflammation is decreasing') {
    const matchedTerms = MEDICAL_DICTIONARY.filter(
      (item) => item.term === 'postoperative' || item.term === 'inflammation'
    );
    return {
      originalText: trimmed,
      simpleExplanation: 'The swelling or irritation after your surgery is getting better.',
      tamilExplanation: 'அறுவை சிகிச்சைக்குப் பிறகு ஏற்பட்ட வீக்கம் அல்லது எரிச்சல் குறைந்து வருகிறது.',
      identifiedTerms: matchedTerms,
      hasRecognizedTerms: true,
    };
  }

  // 2. Identify all medical terms present in the input text
  // Sort dictionary by term length descending so multi-word terms like "incision site" match before "incision"
  const sortedTerms = [...MEDICAL_DICTIONARY].sort((a, b) => b.term.length - a.term.length);
  const foundTerms: MedicalTerm[] = [];

  for (const item of sortedTerms) {
    const termsToTest = [item.term, ...item.aliases];
    const hasMatch = termsToTest.some((keyword) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(trimmed);
    });

    if (hasMatch) {
      // Avoid duplicate matching if multi-word already caught
      if (!foundTerms.some((existing) => existing.term === item.term)) {
        foundTerms.push(item);
      }
    }
  }

  // 3. If no medical terms found:
  if (foundTerms.length === 0) {
    return {
      originalText: trimmed,
      simpleExplanation: 'No simplified explanation is available for this term in the prototype.',
      tamilExplanation: 'இந்த மருத்துவச் சொல்லுக்கு முன்மாதிரி விளக்கம் தற்போது கிடைக்கவில்லை.',
      identifiedTerms: [],
      hasRecognizedTerms: false,
      statusMessage: 'No matching medical terms found in the prototype dictionary.',
    };
  }

  // 4. Rule-based sentence simplification & Tamil translation for arbitrary doctor sentences
  let simplified = trimmed;
  let tamilSentence = '';

  // Common clinical phrases mappings
  const phraseReplacements: [RegExp, string][] = [
    [/\bcontinue monitoring\b/gi, 'keep watching'],
    [/\bmonitoring\b/gi, 'watching closely'],
    [/\bis decreasing\b/gi, 'is getting better and going down'],
    [/\bare decreasing\b/gi, 'are getting better and going down'],
    [/\bis increasing\b/gi, 'is going up'],
    [/\bare increasing\b/gi, 'are going up'],
    [/\bmild\b/gi, 'a small amount of'],
    [/\bsevere\b/gi, 'serious'],
    [/\bprescribed\b/gi, 'recommended by your doctor'],
    [/\brequires\b/gi, 'needs'],
    [/\badminister\b/gi, 'take or receive'],
    [/\btreat\b/gi, 'cure and clear'],
  ];

  // Apply clinical phrase smoothing
  for (const [pattern, replacement] of phraseReplacements) {
    simplified = simplified.replace(pattern, replacement);
  }

  // Replace medical terms with simple English descriptions
  for (const item of sortedTerms) {
    const allKeywords = [item.term, ...item.aliases];
    for (const kw of allKeywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      simplified = simplified.replace(regex, item.simpleEn);
    }
  }

  // Clean up formatting
  simplified = simplified
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;])/g, '$1')
    .trim();
  
  // Capitalize first letter
  if (simplified.length > 0) {
    simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);
  }

  // Generate Tamil explanation based on identified terms
  const tamilTermList = foundTerms.map((t) => `${t.term}: ${t.simpleTa}`).join(', ');
  tamilSentence = `மருத்துவச் சொற்களின் விளக்கம்: ${tamilTermList}. மருத்துவரின் அறிவுரையைத் தொடர்ந்து பின்பற்றுங்கள்.`;

  return {
    originalText: trimmed,
    simpleExplanation: simplified,
    tamilExplanation: tamilSentence,
    identifiedTerms: foundTerms,
    hasRecognizedTerms: true,
  };
}

/**
 * Storage helpers for MediSpeak history in localStorage
 */
export function getMediSpeakHistory(): MediSpeakHistoryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as MediSpeakHistoryRecord[];
  } catch {
    return [];
  }
}

export function saveMediSpeakHistory(record: Omit<MediSpeakHistoryRecord, 'id' | 'timestamp'>): MediSpeakHistoryRecord {
  const history = getMediSpeakHistory();
  const newRecord: MediSpeakHistoryRecord = {
    ...record,
    id: `medispeak-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    // Maintain max 50 entries
    const updated = [newRecord, ...history.slice(0, 49)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save MediSpeak history to localStorage:', err);
  }

  return newRecord;
}

export function deleteMediSpeakHistoryItem(id: string): void {
  try {
    const history = getMediSpeakHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to delete MediSpeak history item:', err);
  }
}

export function clearMediSpeakHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear MediSpeak history:', err);
  }
}

/**
 * Text to Speech Helper using window.speechSynthesis
 */
export function speakText(
  text: string,
  language: 'en' | 'ta',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: Error) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.(new Error('Text-to-speech is not supported in this browser.'));
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any currently playing audio

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clear medical understanding
    utterance.pitch = 1.0;

    if (language === 'ta') {
      utterance.lang = 'ta-IN';
      // Attempt to find Tamil voice if available
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find(
        (v) => v.lang.toLowerCase().includes('ta') || v.name.toLowerCase().includes('tamil')
      );
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
    } else {
      utterance.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.default)
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => {
      // SpeechSynthesis error event
      if (e.error !== 'canceled') {
        onError?.(new Error(`Speech playback issue: ${e.error || 'unknown error'}`));
      }
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error('Unable to start speech synthesis'));
    onEnd?.();
    return false;
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
