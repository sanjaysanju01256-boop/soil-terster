// pages/HistoryPage.tsx
import React from 'react';
import type { HistoryEntry, FarmProfile } from '../types';

interface HistoryPageProps {
  t: any;
  history: HistoryEntry[];
  farms: FarmProfile[];
  onNavigate: (page: string, data: HistoryEntry) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ t, history, farms, onNavigate }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="text-6xl mb-4">📜</div>
        <h2 className="text-2xl font-bold">{t.history_title}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t.history_no_tests}</p>
      </div>
    );
  }
  
  const farmsMap = new Map(farms.map(f => [f.id, f.name]));

  const healthStatusStyles = {
    'Healthy': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Needs Improvement': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Poor': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="p-4 space-y-4">
      {history.map(entry => (
        <div key={entry.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">{`${new Date(entry.timestamp).toLocaleString()}`}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{t.history_farm_name} {farmsMap.get(entry.farmId) || 'Unknown Farm'}</p>
            </div>
            <button onClick={() => onNavigate('analysis', entry)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex-shrink-0 ml-2">
                {t.history_view_analysis}
            </button>
          </div>
          
           <div className={`mt-2 mb-3 inline-block px-2 py-1 text-xs font-semibold rounded-full ${healthStatusStyles[entry.aiResult.soilHealth]}`}>
             {t['health_' + entry.aiResult.soilHealth.toLowerCase().replace(' ', '_')]}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center my-2 border-t border-b border-gray-200 dark:border-gray-600 py-2">
              <div><span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">{t.ph}</span><br/>{entry.values.ph.toFixed(1)}</div>
              <div><span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">{t.moisture}</span><br/>{entry.values.moisture.toFixed(0)}%</div>
              <div><span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">{t.temperature}</span><br/>{entry.values.temperature.toFixed(0)}°C</div>
          </div>
           {entry.location && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                    📍 {entry.location.lat.toFixed(4)}, {entry.location.lon.toFixed(4)}
                </p>
            )}
        </div>
      ))}
    </div>
  );
};

export default HistoryPage;
