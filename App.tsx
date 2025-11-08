// App.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { strings } from './i18n/strings';
import type { Language, SensorData, HistoryEntry, AiAnalysisResult, FarmerProfile, FarmProfile } from './types';
import { getCurrentLocation } from './services/locationService';

// --- Pages & Components ---
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import FutureFeaturePage from './pages/FutureFeaturePage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfilePage from './pages/ProfilePage';
import Drawer from './components/Drawer';
import Header from './components/Header';
import FertilizerCalculatorPage from './pages/FertilizerCalculatorPage';
import SchemesPage from './pages/SchemesPage';

// --- Services ---
import * as bleService from './services/bleService';

const App: React.FC = () => {
    // --- State Management ---
    const [page, setPage] = useState('home');
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');
    const [history, setHistory] = useState<HistoryEntry[]>(() => JSON.parse(localStorage.getItem('history') || '[]'));
    const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => JSON.parse(localStorage.getItem('ttsEnabled') || 'true'));
    
    // Profile State
    const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(() => JSON.parse(localStorage.getItem('farmerProfile') || 'null'));
    const [farmProfiles, setFarmProfiles] = useState<FarmProfile[]>(() => JSON.parse(localStorage.getItem('farmProfiles') || '[]'));

    // Navigation and data passing state
    const [analysisData, setAnalysisData] = useState<SensorData | null>(null);
    const [analysisHistoryEntry, setAnalysisHistoryEntry] = useState<HistoryEntry | null>(null);

    // Bluetooth state
    const [bleStatus, setBleStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [liveSensorData, setLiveSensorData] = useState<SensorData | null>(null);

    // Onboarding check
    const [isInitialized, setIsInitialized] = useState(false);

    // --- Localization ---
    const t = useMemo(() => strings[language], [language]);

    // --- Effects for Persistence ---
    useEffect(() => { localStorage.setItem('language', language); }, [language]);
    useEffect(() => { localStorage.setItem('history', JSON.stringify(history)); }, [history]);
    useEffect(() => { localStorage.setItem('ttsEnabled', JSON.stringify(isTtsEnabled)); }, [isTtsEnabled]);
    useEffect(() => { localStorage.setItem('farmerProfile', JSON.stringify(farmerProfile)); }, [farmerProfile]);
    useEffect(() => { localStorage.setItem('farmProfiles', JSON.stringify(farmProfiles)); }, [farmProfiles]);

    // Onboarding Effect
    useEffect(() => {
        if (!isInitialized) {
            if (!farmerProfile) {
                setPage('profileSetup');
            }
            setIsInitialized(true);
        }
    }, [farmerProfile, isInitialized]);
    
    // Sync profile language with app language
     useEffect(() => {
        if (farmerProfile && farmerProfile.language !== language) {
            setFarmerProfile(p => p ? { ...p, language } : null);
        }
    }, [language, farmerProfile]);


    // --- Navigation Handler ---
    const navigate = useCallback((targetPage: string, data?: SensorData | HistoryEntry) => {
        if (targetPage === 'analysis') {
            if (data && 'values' in data) { // It's a HistoryEntry
                setAnalysisHistoryEntry(data);
                setAnalysisData(data.values);
            } else if (data) { // It's SensorData
                setAnalysisHistoryEntry(null);
                setAnalysisData(data);
            } else {
                 setAnalysisHistoryEntry(null);
                 setAnalysisData(liveSensorData); // Fallback to live data
            }
        }
        setPage(targetPage);
        setDrawerOpen(false);
    }, [liveSensorData]);

    // --- BLE Handlers ---
    const handleConnect = useCallback(async () => {
        if (!bleService.isBluetoothAvailable()) {
            alert(t.ble_no_support);
            return;
        }
        setBleStatus('connecting');
        try {
            await bleService.connectToDevice({
                onConnect: () => setBleStatus('connected'),
                onDisconnect: () => {
                    setBleStatus('disconnected');
                    setLiveSensorData(null);
                },
                onData: (data) => setLiveSensorData(data),
            });
        } catch (error) {
            console.error(error);
            setBleStatus('error');
        }
    }, [t]);

    const handleDisconnect = useCallback(() => {
        bleService.disconnectFromDevice();
    }, []);

    // --- History Handler ---
    const handleSaveToHistory = useCallback(async (data: SensorData, aiResult: AiAnalysisResult, farmId: string) => {
        try {
            const location = await getCurrentLocation();
            const newEntry: HistoryEntry = {
                id: uuidv4(),
                farmId,
                timestamp: Date.now(),
                location,
                values: data,
                aiResult,
            };
            setHistory(prev => [newEntry, ...prev]);
        } catch (error) {
            console.warn("Could not get location, saving without it.", error);
            const newEntry: HistoryEntry = {
                id: uuidv4(),
                farmId,
                timestamp: Date.now(),
                location: null,
                values: data,
                aiResult,
            };
            setHistory(prev => [newEntry, ...prev]);
        }
    }, []);

    // --- Profile Handlers ---
    const handleSaveFarmerProfile = (profile: FarmerProfile) => {
        setFarmerProfile(profile);
        setLanguage(profile.language);
    };

    const handleSaveFarmProfile = (farm: FarmProfile) => {
        setFarmProfiles(prev => {
            const existing = prev.find(f => f.id === farm.id);
            if (existing) {
                return prev.map(f => f.id === farm.id ? farm : f);
            }
            return [...prev, farm];
        });
    };
    
    const handleDeleteFarmProfile = (farmId: string) => {
        if (window.confirm("Are you sure you want to delete this farm? This cannot be undone.")) {
            setFarmProfiles(prev => prev.filter(f => f.id !== farmId));
        }
    };

    // --- Page Rendering Logic ---
    const renderPage = () => {
        if (!isInitialized) return null; // Or a loading spinner

        switch (page) {
            case 'profileSetup':
                return <ProfileSetupPage t={t} onSave={handleSaveFarmerProfile} onComplete={() => setPage('home')} language={language} setLanguage={setLanguage}/>;
            case 'analysis':
                return <AnalysisPage t={t} language={language} isTtsEnabled={isTtsEnabled} initialData={analysisData} existingHistoryEntry={analysisHistoryEntry} onSave={handleSaveToHistory} farmProfiles={farmProfiles} onNavigate={navigate}/>;
            case 'history':
                return <HistoryPage t={t} history={history} farms={farmProfiles} onNavigate={navigate} />;
            case 'settings':
                return <SettingsPage t={t} isTtsEnabled={isTtsEnabled} setIsTtsEnabled={setIsTtsEnabled} language={language} setLanguage={setLanguage} />;
            case 'profile':
                return <ProfilePage t={t} farmerProfile={farmerProfile} onSaveFarmer={handleSaveFarmerProfile} farmProfiles={farmProfiles} onSaveFarm={handleSaveFarmProfile} onDeleteFarm={handleDeleteFarmProfile} />;
            case 'weather':
            case 'disease':
            case 'drone':
            case 'community':
                return <FutureFeaturePage t={t} />;
            case 'fertilizer':
                return <FertilizerCalculatorPage t={t} />;
            case 'schemes':
                 return <SchemesPage t={t} />;
            case 'home':
            default:
                return <HomePage t={t} navigate={navigate} bleStatus={bleStatus} liveSensorData={liveSensorData} onConnect={handleConnect} />;
        }
    };
    
    const pageTitle: { [key: string]: string } = {
        home: t.appName,
        profileSetup: t.profile_setup_title,
        analysis: t.analysis_title,
        history: t.history_title,
        settings: t.settings_title,
        profile: t.profile_title,
        weather: t.menu_weather,
        fertilizer: t.menu_fertilizer,
        schemes: t.menu_schemes,
        community: t.menu_community,
        disease: t.menu_disease,
        drone: t.menu_drone,
    };

    const showHeader = page !== 'profileSetup';

    return (
        <main className="max-w-md mx-auto h-screen bg-gray-200 dark:bg-gray-900 shadow-2xl flex flex-col">
            {showHeader && (
                <Header
                    title={pageTitle[page] || t.appName}
                    showBackButton={page !== 'home'}
                    onBack={() => setPage('home')}
                    onMenuClick={() => setDrawerOpen(true)}
                />
            )}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                onNavigate={navigate}
                t={t}
                currentPage={page}
            />
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex-grow overflow-y-auto">
                <div className="h-full">
                    {renderPage()}
                </div>
            </div>
        </main>
    );
};

export default App;
