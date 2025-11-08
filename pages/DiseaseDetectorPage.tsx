import React from 'react';
import FutureFeaturePage from './FutureFeaturePage';
import { strings } from '../i18n/strings';
import { Language } from '../types';


const DiseaseDetectorPage: React.FC = () => {
  // A bit of a hack to get the language without full context, default to english
  const language = (localStorage.getItem('language') as Language) || 'en';
  const t = strings[language];
  return <FutureFeaturePage t={t} />;
};

export default DiseaseDetectorPage;
