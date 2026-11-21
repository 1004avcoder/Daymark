import React from 'react';
import { Timer, Target, Clock, BarChart3, Settings, LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { formatSeconds } from '../utils/format';

export const Navbar: React.FC = () => {
  const { currentTab, setCurrentTab, activeTimer, elapsedSeconds } = useApp();

  const isTimerRunning = activeTimer.status === 'running';
  const isTimerPaused = activeTimer.status === 'paused';
  const isTimerActive = isTimerRunning || isTimerPaused;

  const tabs: { id: ActiveTab; label: string; icon: LucideIcon }[] = [
    { id: 'timer', label: '타이머', icon: Timer },
    { id: 'goals', label: '목표', icon: Target },
    { id: 'records', label: '기록', icon: Clock },
    { id: 'stats', label: '통계', icon: BarChart3 },
    { id: 'settings', label: '설정', icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-sm">
              <span className="text-sm tracking-tighter font-mono">DM</span>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                DAYMARK
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                  MVP
                </span>
              </h1>
            </div>
          </div>

          {/* Persistent Mini Timer Pill when not on Timer tab */}
          {isTimerActive && currentTab !== 'timer' && (
            <button
              onClick={() => setCurrentTab('timer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-xs transition-all animate-pulse whitespace-nowrap min-w-0 max-w-[180px] ${
                isTimerRunning
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300'
                  : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300'
              }`}
            >
              <span className={`w-2 h-2 shrink-0 rounded-full ${isTimerRunning ? 'bg-indigo-600 animate-ping' : 'bg-amber-500'}`} />
              <span className="font-semibold truncate">{activeTimer.taskTitle || '목표 측정'}</span>
              <span className="font-mono font-bold tracking-tight shrink-0">{formatSeconds(elapsedSeconds)}</span>
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop Tab Links */}
          <nav className="hidden sm:flex items-center gap-1 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-colors">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon size={20} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
                  {tab.id === 'timer' && isTimerRunning && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </div>
                <span className="mt-1">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
