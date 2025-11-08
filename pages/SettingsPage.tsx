import React from 'react';
import { Language } from '../types';

interface SettingsPageProps {
  t: any;
  isTtsEnabled: boolean;
  setIsTtsEnabled: (enabled: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ t, isTtsEnabled, setIsTtsEnabled, language, setLanguage }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">{t.language}</h3>
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 shadow-inner rounded-full p-1">
            <button onClick={() => setLanguage('en')} className={`w-1/2 px-4 py-2 text-sm rounded-full transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>{t.english}</button>
            <button onClick={() => setLanguage('te')} className={`w-1/2 px-4 py-2 text-sm rounded-full transition-colors ${language === 'te' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>{t.telugu}</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <label htmlFor="tts-toggle" className="text-lg font-semibold">
            {t.settings_tts}
          </label>
          <button
            id="tts-toggle"
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              isTtsEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                isTtsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
