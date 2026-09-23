import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Stethoscope,
  Heart,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  BookOpen,
  Languages,
  BookmarkPlus,
  ArrowLeftRight,
  ChevronRight,
  User,
  MessageSquare,
} from 'lucide-react';
import { INDIAN_LANGUAGES, IndianLanguage } from '../types/languages';
import { getAppText } from '../services/appTranslations';
import {
  SimplifiedResult,
  simplifyAndTranslate,
  speakMotherTongue,
  stopSpeaking,
  saveToHistory,
} from '../services/medispeakEngine';

interface TranslatorScreenProps {
  targetLangCode: string;
  appLanguage: IndianLanguage;
  onChangeTargetLang: (lang: IndianLanguage) => void;
  onSavedRecord?: (record: SimplifiedResult) => void;
}

export type TranslationDirection = 'doctor_to_patient' | 'patient_to_doctor';

export const TranslatorScreen: React.FC<TranslatorScreenProps> = ({
  targetLangCode,
  appLanguage,
  onChangeTargetLang,
  onSavedRecord,
}) => {
    const t = getAppText(appLanguage);
  // Option: "Doctor to Patient" or "Patient to Doctor"
  const [direction, setDirection] = useState<TranslationDirection>('doctor_to_patient');

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SimplifiedResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef('');
  const selectedLangObj =
    INDIAN_LANGUAGES.find((l) => l.code === targetLangCode) || INDIAN_LANGUAGES[0];

  // Quick 1-Click Demo Scenarios based on active direction
  const doctorToPatientDemos = [
    {
      label: 'Demo: Post-Op Inflammation',
      text: 'Your postoperative inflammation is decreasing, but continue monitoring the incision site.',
    },
    {
      label: 'Demo: Edema & Analgesic',
      text: 'You have mild edema around the incision. Continue taking your prescribed analgesic.',
    },
    {
      label: 'Demo: Hypertension & Dosage',
      text: 'Your hypertension requires careful daily monitoring and exact dosage of your prescribed medication.',
    },
  ];

  const patientToDoctorDemos = [
    {
      label: 'Demo: Patient Speaks Tamil (Post-op Pain)',
      text: 'அறுவை சிகிச்சைக்குப் பிறகு எனக்கு லேசான வீக்கம் மற்றும் வலி இருக்கிறது, வலி நிவாரணி சாப்பிடலாமா?',
      lang: 'ta',
    },
    {
      label: 'Demo: Dizziness & High BP',
      text: 'எனக்கு தலைச்சுற்றல் மற்றும் இரத்த அழுத்தம் அதிகமாக இருப்பது போல் உணர்கிறேன், என்ன செய்ய வேண்டும்?',
      lang: 'ta',
    },
    {
      label: 'Demo: Medicine Timing Query',
      text: 'மருத்துவர் கொடுத்த மாத்திரையை உணவுக்கு முன்னரா அல்லது பின்னரா சாப்பிட வேண்டும்?',
      lang: 'ta',
    },
  ];

  // Trigger translation
  const handleTranslate = async (
    text: string,
    dir: TranslationDirection = direction,
    targetCode = targetLangCode
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsProcessing(true);
    setRecordingError(null);
    setSavedSuccess(null);

    const role = dir === 'doctor_to_patient' ? 'doctor' : 'patient';
    const sourceLang = dir === 'doctor_to_patient' ? 'en' : targetCode;

    try {
      const res = await simplifyAndTranslate(trimmed, targetCode, role, sourceLang);
      setResult(res);
      saveToHistory(res);
      onSavedRecord?.(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // When target language changes, re-translate
  useEffect(() => {
    if (inputText.trim()) {
      handleTranslate(inputText, direction, targetLangCode);
    }
  }, [targetLangCode]);

  // Handle switching direction ("Doctor to Patient" <-> "Patient to Doctor")
  const switchDirection = (newDir: TranslationDirection) => {
    if (newDir === direction) return;
    setDirection(newDir);
    stopSpeaking();
    setIsSpeaking(false);
    if (isRecording) stopRecording();

    if (newDir === 'doctor_to_patient') {
      setInputText('');
      setResult(null);
    } else {
      setInputText('');
      setResult(null);
    }
  };

  // Speech Recognition
  const startRecording = () => {
    setRecordingError(null);
    latestTranscriptRef.current = '';
    stopSpeaking();
    setIsSpeaking(false);

    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecordingError('Speech recognition is not supported in this browser. Please type words below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // In "doctor_to_patient", doctor speaks English/clinical terms
      // In "patient_to_doctor", patient speaks their mother tongue (e.g. ta-IN for Tamil)
      recognition.lang =
        direction === 'doctor_to_patient' ? 'en-IN' : selectedLangObj.speechCode;

      recognition.onstart = () => setIsRecording(true);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        latestTranscriptRef.current = transcript.trim();
        setInputText(latestTranscriptRef.current);
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        if (e.error === 'not-allowed') {
          setRecordingError('Microphone permission was denied. Please allow microphone access in browser.');
        } else {
          setRecordingError(`Speech error: ${e.error}`);
        }
      };

      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
      setRecordingError('Unable to start microphone.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    const transcript = latestTranscriptRef.current || inputText.trim();
    if (transcript) {
      setInputText(transcript);
      handleTranslate(transcript, direction, targetLangCode);
    }
  };

  // Audio Playback
  const handleListen = () => {
    if (!result) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    // If doctor_to_patient, speak in the patient's mother tongue
    // If patient_to_doctor, speak the translated clinical English
    const textToSpeak =
      direction === 'doctor_to_patient'
        ? result.motherTongueTranslation
        : result.simplifiedEnglish;
    const langCodeForSpeech =
      direction === 'doctor_to_patient' ? targetLangCode : 'en';

    speakMotherTongue(
      textToSpeak,
      langCodeForSpeech,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      (err) => {
        setIsSpeaking(false);
        setRecordingError(err.message);
      }
    );
  };

  // Copy Translation
  const handleCopy = () => {
    if (!result) return;
    const textToCopy =
      direction === 'doctor_to_patient'
        ? result.motherTongueTranslation
        : result.simplifiedEnglish;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save explicitly
  const handleSave = () => {
    if (!result) return;
    saveToHistory(result);
    onSavedRecord?.(result);
    setSavedSuccess('Saved to consultation history!');
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  // Reset
  const handleClear = () => {
    stopSpeaking();
    if (isRecording) stopRecording();
    setInputText('');
    latestTranscriptRef.current = '';
    setResult(null);
    setSavedSuccess(null);
    setRecordingError(null);
    setIsSpeaking(false);
  };

  // Font sizing styles
  const fontSizes = {
    normal: 'text-base sm:text-lg',
    large: 'text-lg sm:text-xl',
    xlarge: 'text-xl sm:text-2xl font-bold',
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-sm border border-teal-700/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/40 border border-teal-400/30 text-xs font-bold text-teal-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t('translator')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {t('medicalTranslator')}
          </h2>
          <p className="text-teal-100 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
                      {t('translatorDescription')}
          </p>
        </div>
      </div>

      {/* Direction Option: Doctor to Patient vs Patient to Doctor */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {t('translationOption')}
            </span>

            {/* Segmented Direction Controls */}
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => switchDirection('doctor_to_patient')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  direction === 'doctor_to_patient'
                    ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-amber-300" />
                <span>{t('doctorToPatient')}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  switchDirection(
                    direction === 'doctor_to_patient' ? 'patient_to_doctor' : 'doctor_to_patient'
                  )
                }
                title={t('translationOption')}
                className="px-2 text-slate-400 hover:text-teal-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => switchDirection('patient_to_doctor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  direction === 'patient_to_doctor'
                    ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-300" />
                              <span>{t('patientToDoctor')}</span>
              </button>
            </div>
          </div>

          {/* Text Size Control */}
          <div className="flex items-center gap-2 self-end md:self-auto">
                        <span className="text-xs text-slate-500 font-medium">{t('textSize')}</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                  fontSize === 'normal' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                  fontSize === 'large' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded text-xs font-black transition-colors ${
                  fontSize === 'xlarge' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                A++
              </button>
            </div>
          </div>
        </div>

        {/* 1-Click Demo Scenarios tailored to direction */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {t('tryDemo')}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(direction === 'doctor_to_patient'
              ? doctorToPatientDemos
              : targetLangCode === 'ta'
              ? patientToDoctorDemos
              : []
            ).map(
              (demo: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(demo.text);
                    handleTranslate(demo.text, direction, targetLangCode);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-400 text-xs font-semibold text-slate-700 hover:text-teal-900 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                >
                  <span>{t('tryDemo')} {idx + 1}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Dual Translator Layout (Input on Left, Output on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Speech & Text Input Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs bg-teal-700">
                  {direction === 'doctor_to_patient' ? (
                    <Stethoscope className="w-5 h-5 text-amber-200" />
                  ) : (
                    <Heart className="w-5 h-5 text-rose-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {direction === 'doctor_to_patient'
                      ? t('doctorSpeech')
                      : `${t('patientVoice')} (${selectedLangObj.nativeName})`}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {direction === 'doctor_to_patient'
                      ? t('doctorVocabulary')
                      : `Patient speaks symptoms or concerns in ${selectedLangObj.nativeName}`}
                  </span>
                </div>
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={handleClear}
                disabled={!inputText && !result}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('reset')}</span>
              </button>
            </div>

            {/* Big 1-Click Microphone Button */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>
                    🎙️ {t('startRecording')} (
                    {direction === 'doctor_to_patient'
                      ? 'Doctor English'
                      : `Patient ${selectedLangObj.nativeName}`}
                    )
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all animate-pulse cursor-pointer"
                >
                  <MicOff className="w-5 h-5" />
                  <span>{t('stopTranslate')}</span>
                </button>
              )}

              <div className="text-xs text-slate-500">
                {isRecording ? (
                  <span className="inline-flex items-center gap-2 text-rose-700 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    {t('listening')}
                  </span>
                ) : (
                  <span>{t('clickMic')}</span>
                )}
              </div>
            </div>

            {recordingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{recordingError}</span>
              </div>
            )}

            {/* Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                {direction === 'doctor_to_patient'
                  ? `${t('doctorSpeech')}:`
                  : `${t('patientVoice')} (${selectedLangObj.nativeName}):`}
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  direction === 'doctor_to_patient'
                    ? 'Speak via mic or type clinical terms (e.g. postoperative inflammation, edema, analgesic, hypertension)...'
                    : `Speak via mic or type symptoms in ${selectedLangObj.nativeName}...`
                }
                className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base leading-relaxed focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            {/* Identified Medical Terms Preview on the input side */}
            {result && result.identifiedTerms.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t('detectedTerms')}</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.identifiedTerms.map((term, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs space-y-0.5"
                    >
                      <div className="font-bold text-teal-950 flex items-center justify-between">
                        <span>{term.term}</span>
                        <span className="text-[10px] text-teal-700 bg-white px-1.5 py-0.2 rounded border border-teal-300">
                          {t('medical')}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        <strong>{t('meaning')}</strong> {term.simpleMeaning}
                      </p>
                      <p className="text-teal-900 font-semibold text-[11px]">
                        <strong>{selectedLangObj.nativeName}:</strong> {term.motherTongueMeaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={() => handleTranslate(inputText, direction, targetLangCode)}
            disabled={isProcessing || !inputText.trim()}
            className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {isProcessing
                ? `${t('translate')}...`
                : direction === 'doctor_to_patient'
                ? `${t('translate')} ${selectedLangObj.nativeName} →`
                : `${t('translateDoctorReview')} →`}
            </span>
          </button>
        </div>

        {/* Right Side: Translation Output Card */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-teal-50/30 to-white rounded-2xl border-2 border-indigo-300 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold shadow-2xs">
                  {direction === 'doctor_to_patient' ? (
                    <Languages className="w-5 h-5" />
                  ) : (
                    <Stethoscope className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {direction === 'doctor_to_patient'
                      ? `${t('motherTongue')} (${selectedLangObj.nativeName} - ${selectedLangObj.name})`
                      : "Doctor's Clinical Summary (English)"}
                  </h3>
                  <span className="text-[11px] text-indigo-700 font-medium">
                    {direction === 'doctor_to_patient'
                      ? t('plainEnglish')
                      : 'Translated clinical summary with identified patient symptoms'}
                  </span>
                </div>
              </div>

              {/* 🔊 Voice Audio Button */}
              {result && (
                <button
                  type="button"
                  onClick={handleListen}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                    isSpeaking
                      ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400/50 animate-pulse'
                      : 'bg-teal-700 text-white border-teal-700 hover:bg-teal-800'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-200" />
                      <span>{t('stopTranslate')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-amber-300" />
                      <span>
                        🔊 {t('translate')} (
                        {direction === 'doctor_to_patient' ? selectedLangObj.nativeName : 'English'}
                        )
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Translation Display Box */}
            {result ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border-2 border-indigo-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-indigo-700" />
                      <span>
                        {direction === 'doctor_to_patient'
                          ? `${selectedLangObj.nativeName} ${t('plainExplanation')}`
                          : t('translateDoctorReview')}
                      </span>
                    </span>
                    <span className="text-[11px] text-indigo-800 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {direction === 'doctor_to_patient' ? t('motherTongue') : t('translateDoctorReview')}
                    </span>
                  </div>

                  <p
                    className={`text-slate-950 font-bold leading-relaxed pt-1 ${fontSizes[fontSize]}`}
                  >
                    "
                    {direction === 'doctor_to_patient'
                      ? result.motherTongueTranslation
                      : result.simplifiedEnglish}
                    "
                  </p>
                </div>

                {/* Secondary Meaning / Plain English */}
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-950 uppercase block">
                    {direction === 'doctor_to_patient'
                      ? `💡 ${t('plainEnglish')}`
                      : `🗣️ ${t('patientVoice')} (${selectedLangObj.nativeName}):`}
                  </span>
                  <p className="text-slate-800 font-medium text-sm leading-relaxed">
                    "
                    {direction === 'doctor_to_patient'
                      ? result.simplifiedEnglish
                      : result.motherTongueTranslation}
                    "
                  </p>
                </div>

                {/* Term Chips */}
                {result.identifiedTerms.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase block">
                      {t('medicalVocabulary')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.identifiedTerms.map((term, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-teal-300 text-teal-900 shadow-2xs"
                        >
                          {term.term} → {term.motherTongueMeaning}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white/70 rounded-2xl border border-dashed border-indigo-200 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-indigo-300" />
                                <p className="text-sm font-semibold text-slate-700">{t('ready')}</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {direction === 'doctor_to_patient'
                    ? `${t('clickMic')}.`
                    : "Patient speaks or types on the left. The doctor's English clinical translation will appear here instantly."}
                </p>
              </div>
            )}

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{savedSuccess}</span>
              </div>
            )}
          </div>

          {/* Bottom Footer Actions */}
          {result && (
            <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('copied') : t('copy')}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{t('saveHistory')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
