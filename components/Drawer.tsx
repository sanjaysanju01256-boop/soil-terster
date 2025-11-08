// components/Drawer.tsx
import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  t: any;
  currentPage: string;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, onNavigate, t, currentPage }) => {
  
  const futureFeatures = ['weather', 'disease', 'drone', 'community'];

  const menuItems = [
    { id: 'profile', label: t.menu_profiles, icon: '👥' },
    { id: 'fertilizer', label: t.menu_fertilizer, icon: '🧮' },
    { id: 'schemes', label: t.menu_schemes, icon: '🏦' },
    { id: 'settings', label: t.settings, icon: '⚙️' },
    { id: 'about', label: t.menu_about, icon: '❓', disabled: true },
  ];
  
  const futureItems = [
     { id: 'weather', label: t.menu_weather, icon: '🌦️' },
     { id: 'disease', label: t.menu_disease, icon: '🔬' },
     { id: 'community', label: t.menu_community, icon: '🗣️' },
     { id: 'drone', label: t.menu_drone, icon: '🚁' },
  ];


  const renderMenuItem = (item: {id: string, label: string, icon: string, disabled?: boolean}, isFuture = false) => (
     <li key={item.id} className="mb-2">
        <button 
          onClick={() => onNavigate(item.id)} 
          disabled={item.disabled || isFuture}
          className={`w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors ${
            item.disabled || isFuture
              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : currentPage === item.id 
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="text-2xl w-8 text-center">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
          {isFuture && <span className="ml-auto text-xs font-semibold bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">{t.comingSoon}</span>}
        </button>
      </li>
  );

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div className={`fixed top-0 left-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{t.menu}</h2>
        </div>
        <nav className="p-4 overflow-y-auto h-[calc(100%-70px)]">
          <ul>
            {menuItems.map(item => renderMenuItem(item))}
            <hr className="my-3 border-gray-200 dark:border-gray-600"/>
            {futureItems.map(item => renderMenuItem(item, true))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Drawer;
