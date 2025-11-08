// pages/AnalysisPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Spinner from '../components/Spinner';
import { getAiAnalysis, generateSpeech } from '../services/geminiService';
import type { Language, SensorData, AiAnalysisResult, HistoryEntry, FarmProfile } from '../types';

// AUDIO HELPERS
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


interface AnalysisPageProps {
  t: any;
  language: Language;
  isTtsEnabled: boolean;
  initialData: SensorData | null;
  existingHistoryEntry: HistoryEntry | null;
  onSave: (data: SensorData, aiResult: AiAnalysisResult, farmId: string) => void;
  farmProfiles: FarmProfile[];
  onNavigate: (page: string) => void;
}

const DataCard: React.FC<{ label: string; value: string; icon: string;}> = ({label, value, icon}) => (
    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-md text-center">
        <div className="text-3xl mb-1">{icon}</div>
        <div className="text-md font-semibold text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

const AnalysisPage: React.FC<AnalysisPageProps> = ({ t, language, isTtsEnabled, initialData, existingHistoryEntry, onSave, farmProfiles, onNavigate }) => {
    const [data, setData] = useState<SensorData>(initialData || { ph: 7.0, moisture: 50, temperature: 25, battery: 100, ts: 0 });
    const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(existingHistoryEntry?.aiResult || null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSaved, setIsSaved] = useState(!!existingHistoryEntry);
    const [selectedFarmId, setSelectedFarmId] = useState<string>(existingHistoryEntry?.farmId || '');

    const audioContext = useMemo(() => new (window.AudioContext || (window as any).webkitAudioContext)(), []);

    useEffect(() => {
        if (initialData) setData(initialData);
        if (farmProfiles.length > 0 && !selectedFarmId) {
            setSelectedFarmId(farmProfiles[0].id);
        }
    }, [initialData, farmProfiles, selectedFarmId]);

    const handleInputChange = (field: keyof SensorData, value: string) => {
        setIsSaved(false);
        setAiResult(null);
        setData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        try {
            const farm = farmProfiles.find(f => f.id === selectedFarmId);
            const result = await getAiAnalysis(data, language, farm);
            setAiResult(result);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if (aiResult && selectedFarmId) {
            onSave(data, aiResult, selectedFarmId);
            setIsSaved(true);
        } else if (!selectedFarmId) {
            alert(t.analysis_select_farm);
        }
    };
    
    const handleSpeak = useCallback(async () => {
        if (!aiResult || isSpeaking || !isTtsEnabled) return;

        setIsSpeaking(true);
        const textToSpeak = `${t.analysis_soil_health}: ${t['health_' + aiResult.soilHealth.toLowerCase().replace(' ', '_')]}. ${t.analysis_crop_suggestions}: ${aiResult.cropSuggestions}. ${t.analysis_fertilizer_advice}: ${aiResult.fertilizerAdvice}. ${t.analysis_irrigation_suggestion}: ${aiResult.irrigationSuggestion}.`;

        try {
            const base64Audio = await generateSpeech(textToSpeak, language);
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0);
                source.onended = () => setIsSpeaking(false);
            } else {
                 setIsSpeaking(false);
            }
        } catch (error) {
            console.error("Error playing speech:", error);
            setIsSpeaking(false);
        }
    }, [aiResult, language, t, isSpeaking, isTtsEnabled, audioContext]);

    const healthStatusStyles = { 'Healthy': 'bg-green-500 text-white', 'Needs Improvement': 'bg-yellow-500 text-black', 'Poor': 'bg-red-500 text-white' };

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DataCard label={t.ph} value={data.ph.toFixed(1)} icon="🧪" />
                <DataCard label={t.moisture} value={`${data.moisture.toFixed(0)}%`} icon="💧" />
                <DataCard label={t.temperature} value={`${data.temperature.toFixed(0)}°C`} icon="🌡️" />
                <DataCard label={t.battery} value={`${data.battery}%`} icon="🔋" />
            </div>

            <details className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow">
                <summary className="font-semibold cursor-pointer">{t.analysis_manual_header}</summary>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t.analysis_manual_desc}</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <input type="number" value={data.ph} onChange={e => handleInputChange('ph', e.target.value)} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-600 text-center" />
                    <input type="number" value={data.moisture} onChange={e => handleInputChange('moisture', e.target.value)} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-600 text-center" />
                    <input type="number" value={data.temperature} onChange={e => handleInputChange('temperature', e.target.value)} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-600 text-center" />
                </div>
            </details>

            <button onClick={handleRunAnalysis} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-lg text-lg shadow-lg flex items-center justify-center gap-2">
                {isLoading ? <Spinner /> : '🤖'} {isLoading ? t.analysis_running : t.analysis_run}
            </button>

            {aiResult && (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg text-center font-bold text-xl shadow-lg ${healthStatusStyles[aiResult.soilHealth]}`}>{t.analysis_soil_health}: {t['health_' + aiResult.soilHealth.toLowerCase().replace(' ', '_')]}</div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-xl font-bold">{t.analysis_report_header}</h3>
                             {isTtsEnabled && <button onClick={handleSpeak} disabled={isSpeaking} className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300">{isSpeaking ? <Spinner/> : '🔊'}</button>}
                        </div>
                        <div className="space-y-3">
                            <div><h4 className="font-semibold text-gray-500 dark:text-gray-400">{t.analysis_crop_suggestions}</h4><p>{aiResult.cropSuggestions}</p></div>
                            <div><h4 className="font-semibold text-gray-500 dark:text-gray-400">{t.analysis_fertilizer_advice}</h4><p>{aiResult.fertilizerAdvice}</p></div>
                            <div><h4 className="font-semibold text-gray-500 dark:text-gray-400">{t.analysis_irrigation_suggestion}</h4><p>{aiResult.irrigationSuggestion}</p></div>
                        </div>
                    </div>

                    {!existingHistoryEntry && farmProfiles.length > 0 && (
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                            <label htmlFor="farm-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.analysis_select_farm}</label>
                            <select id="farm-select" value={selectedFarmId} onChange={e => setSelectedFarmId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                {farmProfiles.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                            </select>
                        </div>
                    )}
                    
                    {!existingHistoryEntry && farmProfiles.length === 0 ? (
                         <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                            <p>{t.analysis_add_farm_prompt}</p>
                            <button onClick={() => onNavigate('profile')} className="mt-2 font-bold underline">{t.analysis_add_farm_button}</button>
                        </div>
                    ) : (
                        <button onClick={handleSave} disabled={isSaved || !selectedFarmId} className={`w-full font-bold py-3 px-4 rounded-lg shadow-lg transition-colors ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400'}`}>
                            {isSaved ? t.analysis_saved : t.analysis_save}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalysisPage;
