import React, { useRef } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Sun,
  Moon,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../utils/storage';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonStr = storage.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daymark_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storage.importBackup(content);
        if (success) {
          alert('데이터 백업을 성공적으로 복원했습니다. 앱을 새로고침합니다.');
          window.location.reload();
        } else {
          alert('백업 파일 형식이 올바르지 않습니다.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '모든 플래너 목표와 기록을 초기화하시겠습니까? 이 작업은 취소할 수 없습니다.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          설정
        </h2>
        <p className="text-xs text-slate-500">
          테마, 주간 기준 및 데이터 백업을 관리합니다
        </p>
      </div>

      {/* 1. Preferences (Week Start Day & Theme) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          환경 설정
        </h3>

        {/* Week Start Day */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <Calendar size={15} className="text-slate-400" />
            <span>주간 시작 요일</span>
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => updateSettings({ weekStartDay: 1 })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                settings.weekStartDay === 1
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              월요일
            </button>
            <button
              onClick={() => updateSettings({ weekStartDay: 0 })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                settings.weekStartDay === 0
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              일요일
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            {settings.theme === 'dark' ? <Moon size={15} className="text-slate-400" /> : <Sun size={15} className="text-slate-400" />}
            <span>테마</span>
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                settings.theme === 'light'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              라이트
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                settings.theme === 'dark'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              다크
            </button>
          </div>
        </div>
      </div>

      {/* 2. Data Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-slate-700 dark:text-slate-300" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            데이터 백업 및 복원
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          데이터는 브라우저 내부(LocalStorage)에 안전하게 저장됩니다. 기기를 변경하거나 백업할 때 JSON 파일로 내보내세요.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Download size={14} />
            백업 내보내기
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Upload size={14} />
            백업 불러오기
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium transition-colors"
          >
            <RefreshCw size={12} />
            전체 데이터 초기화
          </button>
        </div>
      </div>
    </div>
  );
};
