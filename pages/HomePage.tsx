import React from 'react';
import { SensorData } from '../types';
import Spinner from '../components/Spinner';

interface HomePageProps {
    t: any;
    navigate: (page: string, data?: SensorData) => void;
    bleStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    liveSensorData: SensorData | null;
    onConnect: () => void;
}

const LargeButton: React.FC<{ onClick: () => void; text: string; icon: string; disabled?: boolean;}> = ({ onClick, text, icon, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center text-center transition-transform transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:transform-none"
    >
        <span className="text-5xl mb-3">{icon}</span>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{text}</span>
    </button>
);

const HomePage: React.FC<HomePageProps> = ({ t, navigate, bleStatus, liveSensorData, onConnect }) => {
    
    const statusInfo = {
        disconnected: { text: t.ble_disconnected, color: 'bg-red-500', icon: '🔌' },
        connecting: { text: t.ble_connecting, color: 'bg-yellow-500', icon: <Spinner /> },
        connected: { text: t.ble_connected, color: 'bg-green-500', icon: '🔗' },
        error: { text: t.ble_error, color: 'bg-red-700', icon: '⚠️' },
    };

    return (
        <div className="flex flex-col h-full p-4 justify-between">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center">
                <h3 className="text-md font-semibold text-gray-500 dark:text-gray-400">{t.ble_status}</h3>
                <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-lg ${statusInfo[bleStatus].color}`}>
                    {statusInfo[bleStatus].icon}
                    <span>{statusInfo[bleStatus].text}</span>
                </div>
                {bleStatus === 'connected' && liveSensorData && (
                     <div className="grid grid-cols-4 gap-2 text-xs mt-3 text-gray-600 dark:text-gray-300">
                        <span><b>pH:</b> {liveSensorData.ph.toFixed(1)}</span>
                        <span><b>{t.moisture.charAt(0)}:</b> {liveSensorData.moisture.toFixed(0)}%</span>
                        <span><b>{t.temperature.charAt(0)}:</b> {liveSensorData.temperature.toFixed(0)}°C</span>
                        <span><b>{t.battery.charAt(0)}:</b> {liveSensorData.battery}%</span>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 gap-5">
                <LargeButton onClick={onConnect} text={t.home_connect} icon="🛰️" disabled={bleStatus === 'connected' || bleStatus === 'connecting'} />
                <LargeButton onClick={() => navigate('analysis')} text={t.home_start_test} icon="🧪" disabled={bleStatus !== 'connected'} />
                <LargeButton onClick={() => navigate('history')} text={t.home_history} icon="📜" />
            </div>

            <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                <p>{t.appName}</p>
            </div>
        </div>
    );
};

export default HomePage;
