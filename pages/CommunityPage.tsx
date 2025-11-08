import React from 'react';
import FutureFeaturePage from './FutureFeaturePage';
import { strings } from '../i18n/strings';
import { Language } from '../types';


const CommunityPage: React.FC = () => {
  const language = (localStorage.getItem('language') as Language) || 'en';
  const t = strings[language];
  return <FutureFeaturePage t={t} />;
};

export default CommunityPage;
