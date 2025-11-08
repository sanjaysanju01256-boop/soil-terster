import React from 'react';

interface FutureFeaturePageProps {
  t: any;
}

const FutureFeaturePage: React.FC<FutureFeaturePageProps> = ({ t }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-100 dark:bg-gray-800">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t.comingSoon}</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        {t.comingSoonDesc}
      </p>
    </div>
  );
};

export default FutureFeaturePage;
