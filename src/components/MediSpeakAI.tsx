import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bookmark,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Languages,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  History,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import {
  MEDICAL_DICTIONARY,
  DEMO_SENTENCES,
  simplifyDoctorStatement,
  getMediSpeakHistory,
  saveMediSpeakHistory,
  deleteMediSpeakHistoryItem,
  clearMediSpeakHistory,
  speakText,
  stopSpeaking,
  MediSpeakResult,
  MediSpeakHistoryRecord,
  MedicalTerm,
} from '../services/medispeakService';

// SpeechRecognition type declarations for browser support
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface MediSpeakAIProps {
  patientId?: string;
  patientName?: string;
  onSavedToRecord?: (record: MediSpeakHistoryRecord) => void;
}

export const MediSpeakAI: React.FC<MediSpeakAIProps> = ({
  patientId = 'PT-10492',
  patientName = 'John Doe',
  onSavedToRecord,
}) => {
  // Core state
  const [inputText, setInputText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ta'>('en');
  const [result, setResult] = useState<MediSpeakResult | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingLanguage, setSpeakingLanguage] = useState<'en' | 'ta' | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // History & UI state
  const [history, setHistory] = useState<MediSpeakHistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const [showDictionaryHelp, setShowDictionaryHelp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'translate' | 'history'>('translate');

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition & load history on mount
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
    }

    setHistory(getMediSpeakHistory());

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, []);

  // Process input text through the MediSpeak engine
  const handleSimplify = (textToProcess: string) => {
    setRecordingError(null);
    setTtsError(null);
    setSavedSuccessMessage(null);

    const processed = simplifyDoctorStatement(textToProcess);
    setResult(processed);
  };

  // Start Voice Recording
  const startRecording = () => {
    setRecordingError(null);
    setTtsError(null);
    stopSpeaking();
    setIsSpeaking(false);

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      setRecordingError('Speech recognition is not supported in this browser. Please type doctor words below.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
        handleSimplify(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsRecording(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setRecordingError('Microphone permission was denied. Please allow microphone access or use the text box.');
        } else if (event.error === 'no-speech') {
          setRecordingError('No speech was detected. Please try speaking again.');
        } else {
          setRecordingError(`Microphone error: ${event.error}. You can still type below.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setRecordingError('Could not start microphone. Please use manual text input.');
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  // Clear all states
  const handleClear = () => {
    stopSpeaking();
    if (isRecording) {
      stopRecording();
    }
    setInputText('');
    setResult(null);
    setRecordingError(null);
    setTtsError(null);
    setSavedSuccessMessage(null);
    setIsSpeaking(false);
  };

  // Run demo sentence
  const handleSelectDemo = (demo: typeof DEMO_SENTENCES[0]) => {
    stopSpeaking();
    if (isRecording) {
      stopRecording();
    }
    setInputText(demo.doctorStatement);
    handleSimplify(demo.doctorStatement);
  };

  // Handle Text-To-Speech Listen
  const handleListen = (lang: 'en' | 'ta') => {
    setTtsError(null);

    if (isSpeaking && speakingLanguage === lang) {
      stopSpeaking();
      setIsSpeaking(false);
      setSpeakingLanguage(null);
      return;
    }

    if (!result) return;

    const textToSpeak = lang === 'ta' ? result.tamilExplanation : result.simpleExplanation;

    if (!textToSpeak) {
      setTtsError('No explanation text available to speak.');
      return;
    }

    setSpeakingLanguage(lang);
    setIsSpeaking(true);

    speakText(
      textToSpeak,
      lang,
      () => {
        setIsSpeaking(true);
      },
      () => {
        setIsSpeaking(false);
        setSpeakingLanguage(null);
      },
      (err) => {
        setIsSpeaking(false);
        setSpeakingLanguage(null);
        setTtsError(err.message || 'Audio playback unavailable on this device.');
      }
    );
  };

  // Save to CareBridge Record
  const handleSaveToRecord = () => {
    if (!result || !result.originalText) {
      setRecordingError('Cannot save an empty record.');
      return;
    }

    const saved = saveMediSpeakHistory({
      patientId,
      originalStatement: result.originalText,
      simpleExplanation: result.simpleExplanation,
      tamilExplanation: result.tamilExplanation,
      selectedLanguage,
      terms: result.identifiedTerms.map((t) => t.term),
    });

    setHistory(getMediSpeakHistory());
    setSavedSuccessMessage('Saved to CareBridge patient consultation record!');
    onSavedToRecord?.(saved);

    setTimeout(() => {
      setSavedSuccessMessage(null);
    }, 4000);
  };

  // Delete history item
  const handleDeleteHistory = (id: string) => {
    deleteMediSpeakHistoryItem(id);
    setHistory(getMediSpeakHistory());
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-teal-600/60 rounded-full text-xs font-medium text-teal-100 backdrop-blur-sm border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>CareBridge Patient Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <span>🩺 MediSpeak AI</span>
            </h1>
            <p className="text-teal-100 text-sm sm:text-base font-normal">
              Understand your doctor's medical terms in plain, patient-friendly language.
            </p>
          </div>

          {/* Quick patient chip & tab toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-teal-50">
              <span className="opacity-75">Patient:</span> <strong className="font-semibold text-white">{patientName}</strong> ({patientId})
            </div>

            <div className="bg-teal-900/60 p-1 rounded-xl flex items-center border border-teal-500/30">
              <button
                type="button"
                onClick={() => setActiveTab('translate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'translate'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                Translator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({history.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {activeTab === 'translate' ? (
          <>
            {/* Top Control Bar: Language Selector & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-teal-700" />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Preferred Language
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('en')}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selectedLanguage === 'en'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('ta')}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selectedLanguage === 'ta'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      தமிழ் (Tamil)
                    </button>
                  </div>
                </div>
              </div>

              {/* Speech Recognition Mode & Help */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowDictionaryHelp(!showDictionaryHelp)}
                  className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Medical Terms Dictionary ({MEDICAL_DICTIONARY.length})</span>
                  {showDictionaryHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Dictionary Accordion Drawer */}
            {showDictionaryHelp && (
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-teal-900 flex items-center gap-1.5 text-sm">
                    <Stethoscope className="w-4 h-4 text-teal-700" />
                    Recognized Prototype Medical Terms
                  </h4>
                  <span className="text-teal-700">Safe Rule-based Simplified Explanations</span>
                </div>
                <p className="text-teal-800">
                  Click any term to insert into doctor statement:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {MEDICAL_DICTIONARY.map((item) => (
                    <button
                      key={item.term}
                      type="button"
                      onClick={() => {
                        const newText = inputText ? `${inputText} ${item.term}` : `Doctor mentioned ${item.term}.`;
                        setInputText(newText);
                        handleSimplify(newText);
                      }}
                      className="px-2.5 py-1 rounded-md bg-white border border-teal-300 hover:border-teal-500 text-teal-900 font-medium shadow-xs transition-colors text-left"
                      title={`${item.simpleEn} | ${item.simpleTa}`}
                    >
                      <span className="font-semibold">{item.term}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="text-teal-700">{item.simpleEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Speech Recording Controls */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-medium shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium shadow-sm transition-all animate-pulse cursor-pointer"
                    >
                      <MicOff className="w-5 h-5" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {/* Recording Status */}
                  <div className="flex items-center gap-2">
                    {isRecording ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        Listening to doctor... Speak now
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">
                        {speechSupported
                          ? 'Press "Start Recording" or type below'
                          : 'Microphone unavailable. Please type below'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Clear and Reset Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={!inputText && !result}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Error messages */}
              {recordingError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{recordingError}</span>
                </div>
              )}

              {/* Text Input / Speech fallback Area */}
              <div>
                <label
                  htmlFor="doctor-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Doctor's Words (Speech-to-Text or Manual Input)
                </label>
                <div className="relative">
                  <textarea
                    id="doctor-input"
                    rows={3}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      handleSimplify(e.target.value);
                    }}
                    placeholder="Doctor says... (e.g. Your postoperative inflammation is decreasing, but continue monitoring the incision site.)"
                    className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm leading-relaxed transition-all shadow-2xs"
                  />
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        setResult(null);
                      }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Try Example Buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">
                  Try Demo Examples (No microphone required):
                </span>
                <div className="flex flex-wrap gap-2">
                  {DEMO_SENTENCES.slice(0, 3).map((demo, idx) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleSelectDemo(demo)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-teal-200 hover:border-teal-500 hover:bg-teal-50/50 text-slate-700 hover:text-teal-900 text-xs font-medium transition-all shadow-2xs text-left"
                    >
                      <span className="text-teal-700 font-semibold mr-1.5">Example {idx + 1}:</span>
                      <span>"{demo.doctorStatement.substring(0, 42)}..."</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Output Section */}
            {result && result.originalText && (
              <div className="space-y-5 animate-fadeIn">
                {/* 1. Doctor's Words Section */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      👨‍⚕️ Doctor's Words
                    </span>
                    <span className="text-xs text-slate-400">Captured statement</span>
                  </div>
                  <p className="text-slate-900 font-medium text-base sm:text-lg leading-relaxed italic">
                    "{result.originalText}"
                  </p>

                  {/* Identified Medical Terms Tags */}
                  {result.identifiedTerms.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium mr-1">Medical Terms Found:</span>
                      {result.identifiedTerms.map((t) => (
                        <span
                          key={t.term}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200"
                        >
                          <span className="font-semibold">{t.term}</span>
                          <span className="text-teal-600">({t.simpleEn})</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Simple Explanation Section */}
                <div className="p-5 sm:p-6 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <h3 className="text-sm sm:text-base font-bold text-emerald-950 uppercase tracking-wide">
                        Simple Explanation (Patient-Friendly)
                      </h3>
                    </div>

                    {/* Listen Button for English */}
                    <button
                      type="button"
                      onClick={() => handleListen('en')}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSpeaking && speakingLanguage === 'en'
                          ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-400/50'
                          : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      {isSpeaking && speakingLanguage === 'en' ? (
                        <>
                          <VolumeX className="w-4 h-4 text-amber-200" />
                          <span>Stop Listening</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-emerald-700" />
                          <span>🔊 Listen</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-slate-900 text-base sm:text-lg font-medium leading-relaxed bg-white/80 p-4 rounded-lg border border-emerald-100">
                    "{result.simpleExplanation}"
                  </p>

                  {!result.hasRecognizedTerms && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-md border border-amber-200">
                      ⚠️ Note: No simplified explanation is available for this term in the prototype. Please ask your healthcare provider for direct clarification.
                    </p>
                  )}
                </div>

                {/* 3. Tamil Explanation Section (When Tamil selected or requested) */}
                {(selectedLanguage === 'ta' || result.tamilExplanation) && (
                  <div className="p-5 sm:p-6 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇮🇳</span>
                          <h3 className="text-sm sm:text-base font-bold text-indigo-950 uppercase tracking-wide">
                            Tamil Explanation (தமிழ் விளக்கம்)
                          </h3>
                        </div>
                        <span className="text-xs text-indigo-600 font-medium">
                          Prototype Tamil Translation
                        </span>
                      </div>

                      {/* Listen Button for Tamil */}
                      <button
                        type="button"
                        onClick={() => handleListen('ta')}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSpeaking && speakingLanguage === 'ta'
                            ? 'bg-indigo-700 text-white border-indigo-700 ring-2 ring-indigo-400/50'
                            : 'bg-white text-indigo-900 border-indigo-300 hover:bg-indigo-100'
                        }`}
                      >
                        {isSpeaking && speakingLanguage === 'ta' ? (
                          <>
                            <VolumeX className="w-4 h-4 text-amber-200" />
                            <span>Stop Tamil Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-indigo-700" />
                            <span>🔊 Listen (Tamil)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-slate-900 text-base sm:text-lg font-medium leading-relaxed bg-white/80 p-4 rounded-lg border border-indigo-100">
                      "{result.tamilExplanation}"
                    </p>
                  </div>
                )}

                {/* Audio or TTS status/error notification */}
                {ttsError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{ttsError}</span>
                  </div>
                )}

                {/* Save Feedback Banner */}
                {savedSuccessMessage && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-xl flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-medium">{savedSuccessMessage}</span>
                  </div>
                )}

                {/* Action Buttons: Clear & Save to Record */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors cursor-pointer"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToRecord}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Save to Record</span>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* History View Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-teal-700" />
                  Saved MediSpeak Consultations
                </h3>
                <p className="text-xs text-slate-500">
                  Stored securely in your CareBridge record for this patient.
                </p>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear all MediSpeak history records?')) {
                      clearMediSpeakHistory();
                      setHistory([]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium text-sm">No saved MediSpeak explanations yet.</p>
                <p className="text-slate-400 text-xs mt-1">
                  Translate doctor terms and click "Save to Record" to keep notes here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('translate')}
                  className="mt-4 px-4 py-2 bg-teal-700 text-white text-xs font-medium rounded-lg hover:bg-teal-800 transition-colors"
                >
                  Try a Translation Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-200 hover:shadow-xs transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-teal-800">
                        {new Date(record.timestamp).toLocaleDateString()} at{' '}
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium uppercase">
                          {record.selectedLanguage}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteHistory(record.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Doctor's Statement:</div>
                      <div className="text-slate-800 text-sm font-medium">"{record.originalStatement}"</div>
                    </div>

                    <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                      <div className="text-xs text-emerald-800 uppercase font-semibold">Simplified:</div>
                      <div className="text-emerald-950 text-sm font-medium">"{record.simpleExplanation}"</div>
                    </div>

                    {record.tamilExplanation && (
                      <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                        <div className="text-xs text-indigo-800 uppercase font-semibold">Tamil:</div>
                        <div className="text-indigo-950 text-sm font-medium">"{record.tamilExplanation}"</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {record.terms?.map((term) => (
                          <span
                            key={term}
                            className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                          >
                            {term}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setInputText(record.originalStatement);
                          handleSimplify(record.originalStatement);
                          setActiveTab('translate');
                        }}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                      >
                        Reload in Translator →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Safety Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs sm:text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Important Medical Notice & Safety Disclaimer</span>
          </div>
          <p className="text-amber-800 leading-relaxed pl-6">
            MediSpeak AI simplifies medical language for understanding. It does not provide diagnosis or medical advice.
            Always follow your doctor's instructions.
          </p>
        </div>
      </div>
    </div>
  );
};
