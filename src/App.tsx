import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Globe,
  Sparkles,
  FileText,
  ShieldCheck,
  Languages,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { INDIAN_LANGUAGES, IndianLanguage } from './types/languages';
import { TranslatorScreen } from './components/TranslatorScreen';
import { TranscriptHistoryView } from './components/TranscriptHistoryView';
import { getHistory, SimplifiedResult } from './services/medispeakEngine';
import { getAppText } from './services/appTranslations';

export default function App() {
  // Menu navigation: ONLY 'translator' and 'history' as requested
  const [activeTab, setActiveTab] = useState<'translator' | 'history'>('translator');
  const [targetLangCode, setTargetLangCode] = useState<string>('ta'); // Default to Tamil
  const [history, setHistory] = useState<SimplifiedResult[]>([]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const refreshHistory = () => {
    setHistory(getHistory());
  };

  const currentLang =
    INDIAN_LANGUAGES.find((l) => l.code === targetLangCode) || INDIAN_LANGUAGES[0];
  const t = getAppText(currentLang);

  const handleSelectLanguage = (lang: IndianLanguage) => {
    setTargetLangCode(lang.code);
    setShowLangDropdown(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo & Website Name */}
            <button type="button" onClick={() => setShowSidebar(true)} className="p-2 mr-2 rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-cyan-600 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-500/20">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    MediSpeak <span className="text-teal-600">AI</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden md:block">
                  {t('tagline')}
                </p>
              </div>
            </div>

            <nav className="hidden">
              <button
                type="button"
                onClick={() => setActiveTab('translator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'translator'
                    ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Languages className="w-4 h-4 text-amber-300" />
                <span>Translator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>History</span>
                {history.length > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      activeTab === 'history'
                        ? 'bg-teal-900 text-teal-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {history.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Quick Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition-colors cursor-pointer"
                title="Change Mother Tongue"
              >
                <Globe className="w-4 h-4 text-teal-600" />
                <span className="hidden md:inline">{t('motherTongue')}:</span><span>{currentLang.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 max-h-96 overflow-y-auto space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t('selectMotherTongue')}
                    </span>
                    <span className="text-[10px] text-teal-600 font-semibold">13 Languages</span>
                  </div>
                  {INDIAN_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        lang.code === targetLangCode
                          ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-semibold">{lang.nativeName}</span>
                      <span className="text-slate-400 text-[11px]">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {activeTab === 'translator' && (
          <TranslatorScreen
            targetLangCode={targetLangCode}
            appLanguage={currentLang}
            onChangeTargetLang={handleSelectLanguage}
            onSavedRecord={refreshHistory}
          />
        )}

        {activeTab === 'history' && (
          <TranscriptHistoryView history={history} onRefreshHistory={refreshHistory} appLanguage={currentLang} />
        )}
      </main>

      {/* Clean Accessible Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">MediSpeak AI</span>
            <span>•</span>
            <span>{t('motherTongue')} Medical Translation in All Indian Languages</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Clear Patient Comprehension • Medical Terminology Simplification</span>
          </div>
        </div>
      </footer>

      {showSidebar && (
        <>
          <button type="button" aria-label="Close menu" onClick={() => setShowSidebar(false)} className="fixed inset-0 bg-slate-950/30 z-[60] cursor-default" />
          <aside className="fixed left-0 top-0 bottom-0 z-[70] w-72 bg-white shadow-2xl p-5">
            <div className="flex items-center justify-between pb-5 border-b border-slate-200">
              <span className="font-black text-slate-900">MediSpeak <span className="text-teal-600">AI</span></span>
              <button type="button" onClick={() => setShowSidebar(false)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Close menu"><X className="w-5 h-5" /></button>
            </div>
            <nav className="pt-5 space-y-2">
              <button type="button" onClick={() => { setActiveTab('translator'); setShowSidebar(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-left ${activeTab === 'translator' ? 'bg-teal-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}><Languages className="w-5 h-5" />{t('translator')}</button>
              <button type="button" onClick={() => { setActiveTab('history'); setShowSidebar(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-left ${activeTab === 'history' ? 'bg-teal-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}><FileText className="w-5 h-5" />{t('history')} <span className="ml-auto">{history.length}</span></button>
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}
