import React from 'react';
import { Globe, Check } from 'lucide-react';
import { INDIAN_LANGUAGES, IndianLanguage } from '../types/languages';

interface LanguageSelectorProps {
  selectedCode: string;
  onSelectLanguage: (lang: IndianLanguage) => void;
  label?: string;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedCode,
  onSelectLanguage,
  label = 'Select Mother Tongue',
  className = '',
}) => {
  const currentLang = INDIAN_LANGUAGES.find((l) => l.code === selectedCode) || INDIAN_LANGUAGES[0];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>{label}</span>
        </label>
      )}

      {/* Main Grid of Quick Language Badges */}
      <div className="flex flex-wrap gap-1.5">
        {INDIAN_LANGUAGES.map((lang) => {
          const isSelected = lang.code === selectedCode;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
              }`}
            >
              <span className="font-semibold">{lang.nativeName}</span>
              <span className={`text-[10px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                ({lang.name})
              </span>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
