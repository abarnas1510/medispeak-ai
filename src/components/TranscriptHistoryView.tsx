import React, { useState } from 'react';
import {
  FileText,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Stethoscope,
  Heart,
  Calendar,
} from 'lucide-react';
import {
  SimplifiedResult,
  deleteHistoryItem,
  clearAllHistory,
  speakMotherTongue,
  stopSpeaking,
} from '../services/medispeakEngine';
import { INDIAN_LANGUAGES, IndianLanguage } from '../types/languages';
import { getAppText } from '../services/appTranslations';

interface TranscriptHistoryViewProps {
  history: SimplifiedResult[];
  onRefreshHistory: () => void;
  appLanguage: IndianLanguage;
}

export const TranscriptHistoryView: React.FC<TranscriptHistoryViewProps> = ({
  history,
  onRefreshHistory,
  appLanguage,
}) => {
  const t = getAppText(appLanguage);
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simplifiedEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.motherTongueTranslation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.identifiedTerms.some((t) => t.term.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLang = langFilter === 'all' || item.targetLang === langFilter;

    return matchesSearch && matchesLang;
  });

  const handleSpeak = (item: SimplifiedResult) => {
    if (speakingId === item.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(item.id);
    speakMotherTongue(
      item.motherTongueTranslation,
      item.targetLang,
      () => setSpeakingId(item.id),
      () => setSpeakingId(null),
      () => setSpeakingId(null)
    );
  };

  const handleCopy = (item: SimplifiedResult) => {
    const textToCopy = `Doctor Words: ${item.sourceText}\nSimplified: ${item.simplifiedEnglish}\n${item.targetLangName} Translation: ${item.motherTongueTranslation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    onRefreshHistory();
  };

  const handleExportText = () => {
    const content = history
      .map(
        (h, idx) =>
          `[#${idx + 1}] Date: ${new Date(h.timestamp).toLocaleString()}\nRole: ${h.role}\nLanguage: ${h.targetLangName}\nOriginal Statement: "${h.sourceText}"\nSimplified English: "${h.simplifiedEnglish}"\nMother Tongue: "${h.motherTongueTranslation}"\nTerms: ${h.identifiedTerms.map((t) => `${t.term} (${t.motherTongueMeaning})`).join(', ')}\n----------------------------------------\n`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medispeak-consultation-transcripts-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />
            <span>📋 {t('consultationHistory')}</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {t('historyDescription')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportText}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span>{t('exportText')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all consultation transcripts?')) {
                    clearAllHistory();
                    onRefreshHistory();
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clearAll')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">{t('allLanguages')}</option>
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transcript Items */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">{t('noTranscripts')}</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Speak or type in the Doctor or Patient screen to create automatic mother-tongue simplified transcripts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all space-y-3"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold ${
                      item.role === 'doctor'
                        ? 'bg-teal-100 text-teal-800 border border-teal-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.role === 'doctor' ? (
                      <Stethoscope className="w-3 h-3 text-teal-700" />
                    ) : (
                      <Heart className="w-3 h-3 text-emerald-700" />
                    )}
                    <span>{item.role === 'doctor' ? t('doctorDictation') : t('patientInquiry')}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
                    {item.targetLangName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()} at{' '}
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Audio Playback */}
                  <button
                    type="button"
                    onClick={() => handleSpeak(item)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      speakingId === item.id
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Listen to translation"
                  >
                    {speakingId === item.id ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                    )}
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    title="Copy transcript"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Original Statement */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('originalWords')}
                </span>
                <p className="text-slate-800 text-sm font-medium italic mt-0.5">"{item.sourceText}"</p>
              </div>

              {/* Simplified English */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-600 uppercase block mb-0.5">
                  {t('plainExplanation')}
                </span>
                <p className="text-slate-900 font-medium">{item.simplifiedEnglish}</p>
              </div>

              {/* Mother Tongue Translation */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block">
                  {t('motherTongueTranslation')} ({item.targetLangName}):
                </span>
                <p className="text-slate-900 font-bold text-base sm:text-lg leading-relaxed">
                  "{item.motherTongueTranslation}"
                </p>
              </div>

              {/* Terms breakdown */}
              {item.identifiedTerms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Medical Terms:</span>
                  {item.identifiedTerms.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-teal-200 text-teal-800 shadow-2xs"
                    >
                      {t.term} → {t.motherTongueMeaning}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
