import React from 'react';

interface HeaderProps {
  title: string;
  showBackButton: boolean;
  onBack: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton, onBack, onMenuClick }) => {
  return (
    <header className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
      <div className="flex items-center min-w-0">
        {showBackButton ? (
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Go back">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        ) : (
          <div className="w-10 h-10"></div> // Placeholder for alignment
        )}
        <h1 className="text-xl font-bold ml-2 truncate">{title}</h1>
      </div>
      
      <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Open menu">
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </header>
  );
};

export default Header;
