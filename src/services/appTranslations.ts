import { IndianLanguage } from '../types/languages';

export type AppTranslationKey =
  | 'tagline'
  | 'translator'
  | 'history'
  | 'motherTongue'
  | 'selectMotherTongue'
  | 'translationOption'
  | 'doctorToPatient'
  | 'patientToDoctor'
  | 'textSize'
  | 'tryDemo'
  | 'medicalTranslator'
  | 'translatorDescription'
  | 'doctorSpeech'
  | 'patientVoice'
  | 'doctorVocabulary'
  | 'reset'
  | 'startRecording'
  | 'stopTranslate'
  | 'listening'
  | 'clickMic'
  | 'detectedTerms'
  | 'meaning'
  | 'medical'
  | 'translate'
  | 'translateDoctorReview'
  | 'plainEnglish'
  | 'medicalVocabulary'
  | 'ready'
  | 'copy'
  | 'copied'
  | 'saveHistory'
  | 'savedHistory'
  | 'consultationHistory'
  | 'historyDescription'
  | 'exportText'
  | 'clearAll'
  | 'noTranscripts'
  | 'searchPlaceholder'
  | 'allLanguages'
  | 'originalWords'
  | 'plainExplanation'
  | 'motherTongueTranslation'
  | 'doctorDictation'
  | 'patientInquiry';

type TranslationTable = Partial<Record<AppTranslationKey, string>>;

const english: Record<AppTranslationKey, string> = {
  tagline: "Doctor's Medical Terms Converted into Your Mother Tongue",
  translator: 'Translator', history: 'History', motherTongue: 'Mother Tongue',
  selectMotherTongue: 'Select Mother Tongue', translationOption: 'Translation Option:',
  doctorToPatient: 'Doctor to Patient', patientToDoctor: 'Patient to Doctor', textSize: 'Text Size:',
  tryDemo: 'Try 1-Click Demo:', medicalTranslator: 'MediSpeak AI Medical Translator',
  translatorDescription: 'Converts complex doctor terminology into simple mother-tongue words so patients and families understand every clinical instruction clearly.',
  doctorSpeech: "Doctor's Speech (Clinical Terms)", patientVoice: "Patient's Voice", doctorVocabulary: 'Doctor uses technical medical vocabulary',
  reset: 'Reset', startRecording: 'Start Recording', stopTranslate: 'Stop & Translate Now', listening: 'Listening live...',
  clickMic: 'Click microphone or type words below', detectedTerms: 'Detected Difficult Medical Terms:', meaning: 'Meaning:', medical: 'Medical',
  translate: 'Translate', translateDoctorReview: 'Translate for Doctor Review', plainEnglish: 'Plain English Explanation (No Medical Jargon):',
  medicalVocabulary: 'Medical Vocabulary Identified:', ready: 'Ready to Translate', copy: 'Copy Translation', copied: 'Copied!', saveHistory: 'Save to History',
  savedHistory: 'Saved to consultation history!', consultationHistory: 'Consultation Transcript History',
  historyDescription: 'Complete record of speech recordings, simplified medical explanations, and mother-tongue translations.',
  exportText: 'Export Text', clearAll: 'Clear All', noTranscripts: 'No consultation transcripts found',
  searchPlaceholder: 'Search by medical term, doctor words, or translation...', allLanguages: 'All Indian Languages',
  originalWords: "Original Doctor's Words:", plainExplanation: 'Plain Explanation:', motherTongueTranslation: 'Mother Tongue Translation',
  doctorDictation: 'Doctor Dictation', patientInquiry: 'Patient Inquiry',
};

const localized: Record<string, TranslationTable> = {
  ta: { tagline: 'மருத்துவ சொற்களை உங்கள் தாய்மொழியில் புரிந்துகொள்ளுங்கள்', translator: 'மொழிபெயர்ப்பாளர்', history: 'வரலாறு', motherTongue: 'தாய்மொழி', selectMotherTongue: 'தாய்மொழியைத் தேர்ந்தெடுக்கவும்', translationOption: 'மொழிபெயர்ப்பு தேர்வு:', doctorToPatient: 'மருத்துவரிடம் இருந்து நோயாளிக்கு', patientToDoctor: 'நோயாளியிடம் இருந்து மருத்துவருக்கு', textSize: 'எழுத்து அளவு:', tryDemo: 'ஒரு கிளிக் மாதிரி:', medicalTranslator: 'MediSpeak AI மருத்துவ மொழிபெயர்ப்பாளர்', translatorDescription: 'சிக்கலான மருத்துவ சொற்களை எளிய தாய்மொழி வார்த்தைகளாக மாற்றுகிறது.', doctorSpeech: 'மருத்துவரின் பேச்சு', patientVoice: 'நோயாளியின் குரல்', doctorVocabulary: 'மருத்துவர் மருத்துவ சொற்களைப் பயன்படுத்துகிறார்', reset: 'மீட்டமை', startRecording: 'பதிவு தொடங்கு', stopTranslate: 'நிறுத்தி மொழிபெயர்க்கவும்', listening: 'கேட்கிறது...', clickMic: 'மைக்ரோஃபோனை கிளிக் செய்யவும் அல்லது கீழே தட்டச்சு செய்யவும்', detectedTerms: 'கண்டறியப்பட்ட மருத்துவ சொற்கள்:', meaning: 'பொருள்:', medical: 'மருத்துவம்', translate: 'மொழிபெயர்க்கவும்', translateDoctorReview: 'மருத்துவர் பார்வைக்கு மொழிபெயர்க்கவும்', plainEnglish: 'எளிய விளக்கம்:', medicalVocabulary: 'கண்டறியப்பட்ட மருத்துவ சொற்கள்:', ready: 'மொழிபெயர்க்கத் தயார்', copy: 'மொழிபெயர்ப்பை நகலெடு', copied: 'நகலெடுக்கப்பட்டது!', saveHistory: 'வரலாற்றில் சேமி', savedHistory: 'ஆலோசனை வரலாற்றில் சேமிக்கப்பட்டது!', consultationHistory: 'ஆலோசனை பதிவுகள்', historyDescription: 'பேச்சு பதிவுகள் மற்றும் மருத்துவ விளக்கங்களின் முழுமையான பதிவு.', exportText: 'உரையை ஏற்றுமதி செய்', clearAll: 'அனைத்தையும் அழி', noTranscripts: 'ஆலோசனை பதிவுகள் இல்லை', searchPlaceholder: 'மருத்துவ சொல் அல்லது மொழிபெயர்ப்பைத் தேடுங்கள்...', allLanguages: 'அனைத்து இந்திய மொழிகள்', originalWords: 'மருத்துவரின் அசல் வார்த்தைகள்:', plainExplanation: 'எளிய விளக்கம்:', motherTongueTranslation: 'தாய்மொழி மொழிபெயர்ப்பு', doctorDictation: 'மருத்துவர் பதிவு', patientInquiry: 'நோயாளி கேள்வி' },
  hi: { translator: 'अनुवादक', history: 'इतिहास', motherTongue: 'मातृभाषा', selectMotherTongue: 'मातृभाषा चुनें', translationOption: 'अनुवाद विकल्प:', doctorToPatient: 'डॉक्टर से मरीज', patientToDoctor: 'मरीज से डॉक्टर', textSize: 'अक्षर आकार:', tryDemo: 'एक-क्लिक डेमो:', medicalTranslator: 'MediSpeak AI मेडिकल अनुवादक', translatorDescription: 'जटिल चिकित्सा शब्दों को सरल मातृभाषा में बदलता है।', doctorSpeech: 'डॉक्टर की बात', patientVoice: 'मरीज की आवाज', doctorVocabulary: 'डॉक्टर तकनीकी चिकित्सा शब्दों का उपयोग करते हैं', reset: 'रीसेट', startRecording: 'रिकॉर्डिंग शुरू करें', stopTranslate: 'रोकें और अनुवाद करें', listening: 'सुन रहा है...', clickMic: 'माइक्रोफोन दबाएं या नीचे लिखें', detectedTerms: 'पहचाने गए कठिन चिकित्सा शब्द:', meaning: 'अर्थ:', medical: 'चिकित्सा', translate: 'अनुवाद करें', translateDoctorReview: 'डॉक्टर की समीक्षा के लिए अनुवाद करें', plainEnglish: 'सरल अंग्रेजी व्याख्या:', medicalVocabulary: 'पहचानी गई चिकित्सा शब्दावली:', ready: 'अनुवाद के लिए तैयार', copy: 'अनुवाद कॉपी करें', copied: 'कॉपी हो गया!', saveHistory: 'इतिहास में सहेजें', savedHistory: 'परामर्श इतिहास में सहेजा गया!', consultationHistory: 'परामर्श प्रतिलेख इतिहास', historyDescription: 'रिकॉर्डिंग और सरल चिकित्सा व्याख्याओं का पूरा रिकॉर्ड।', exportText: 'टेक्स्ट निर्यात करें', clearAll: 'सभी साफ करें', noTranscripts: 'कोई परामर्श प्रतिलेख नहीं मिला', searchPlaceholder: 'चिकित्सा शब्द या अनुवाद खोजें...', allLanguages: 'सभी भारतीय भाषाएं', originalWords: 'डॉक्टर के मूल शब्द:', plainExplanation: 'सरल व्याख्या:', motherTongueTranslation: 'मातृभाषा अनुवाद', doctorDictation: 'डॉक्टर का कथन', patientInquiry: 'मरीज का सवाल' },
  te: { translator: 'అనువాదకుడు', history: 'చరిత్ర', motherTongue: 'మాతృభాష', selectMotherTongue: 'మాతృభాషను ఎంచుకోండి', translationOption: 'అనువాద ఎంపిక:', doctorToPatient: 'డాక్టర్ నుండి రోగికి', patientToDoctor: 'రోగి నుండి డాక్టర్‌కు', textSize: 'అక్షర పరిమాణం:', tryDemo: 'ఒక క్లిక్ డెమో:', reset: 'రీసెట్', startRecording: 'రికార్డింగ్ ప్రారంభించండి', stopTranslate: 'ఆపి అనువదించండి', listening: 'వింటోంది...', clickMic: 'మైక్రోఫోన్ క్లిక్ చేయండి లేదా దిగువ టైప్ చేయండి', detectedTerms: 'గుర్తించిన వైద్య పదాలు:', meaning: 'అర్థం:', medical: 'వైద్యం', translate: 'అనువదించండి', ready: 'అనువదించడానికి సిద్ధం', copy: 'అనువాదాన్ని కాపీ చేయండి', copied: 'కాపీ అయింది!', saveHistory: 'చరిత్రలో సేవ్ చేయండి', exportText: 'టెక్స్ట్ ఎగుమతి', clearAll: 'అన్నీ తొలగించండి', allLanguages: 'అన్ని భారతీయ భాషలు', motherTongueTranslation: 'మాతృభాష అనువాదం' },
};

export function getAppText(language: IndianLanguage | string) {
  const code = typeof language === 'string' ? language : language.code;
  const table = localized[code] || {};
  return (key: AppTranslationKey) => table[key] || english[key];
}
