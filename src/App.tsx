import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TimerView } from './components/TimerView';
import { GoalsView } from './components/GoalsView';
import { RecordsView } from './components/RecordsView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { RecordEditModal } from './components/RecordEditModal';
import { DateGoalModal } from './components/DateGoalModal';

const AppContent: React.FC = () => {
  const { currentTab, settings } = useApp();

  // Dark mode effect
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 pb-20 sm:pb-10 pt-2">
        {currentTab === 'timer' && <TimerView />}
        {currentTab === 'goals' && <GoalsView />}
        {currentTab === 'records' && <RecordsView />}
        {currentTab === 'stats' && <StatsView />}
        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <RecordEditModal />
      <DateGoalModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
