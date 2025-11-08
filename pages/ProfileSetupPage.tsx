// pages/ProfileSetupPage.tsx
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Language, FarmerProfile } from '../types';

interface ProfileSetupPageProps {
  t: any;
  onSave: (profile: FarmerProfile) => void;
  onComplete: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({ t, onSave, onComplete, language, setLanguage }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim() === '') {
      alert("Please enter your name.");
      return;
    }
    const newProfile: FarmerProfile = {
      id: uuidv4(),
      name: name.trim(),
      language: language,
    };
    onSave(newProfile);
    onComplete();
  };

  return (
    <div className="flex flex-col h-full p-6 justify-center bg-gray-100 dark:bg-gray-800">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-3xl font-bold">{t.profile_setup_title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{t.profile_setup_desc}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.form_name}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shadow-sm p-3 text-lg"
              placeholder="Your Name"
              required
            />
        </div>
        
         <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.language}</h3>
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 shadow-inner rounded-full p-1">
                <button onClick={() => setLanguage('en')} className={`w-1/2 px-4 py-2 text-sm rounded-full transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>{t.english}</button>
                <button onClick={() => setLanguage('te')} className={`w-1/2 px-4 py-2 text-sm rounded-full transition-colors ${language === 'te' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>{t.telugu}</button>
            </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-lg text-lg shadow-lg">
          {t.profile_setup_continue}
        </button>
        <button onClick={onComplete} className="w-full text-sm text-gray-500 dark:text-gray-400 hover:underline">
          {t.skip}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
