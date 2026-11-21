import React, { useState, useMemo } from 'react';
import { Clock, Trash2, Edit3, StickyNote, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityIcon } from './ActivityIcon';
import { formatDate, formatTimeOnly, formatDurationKorean } from '../utils/format';

export const RecordsView: React.FC = () => {
  const { records, deleteRecord, setEditingRecord, setCurrentTab } = useApp();
  const [selectedTitleFilter, setSelectedTitleFilter] = useState<string>('all');

  // Unique titles
  const uniqueTitles = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.title) set.add(r.title);
    });
    return Array.from(set);
  }, [records]);

  const filteredRecords = useMemo(() => {
    let list = [...records];
    if (selectedTitleFilter !== 'all') {
      list = list.filter((r) => r.title === selectedTitleFilter);
    }
    // Sort descending by startTime
    return list.sort((a, b) => b.startTime - a.startTime);
  }, [records, selectedTitleFilter]);

  // Group records by Date
  const groupedRecords = useMemo(() => {
    const groups: { [dateStr: string]: typeof filteredRecords } = {};
    filteredRecords.forEach((rec) => {
      const dateKey = formatDate(rec.startTime);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(rec);
    });
    return groups;
  }, [filteredRecords]);

  const handleDelete = (id: string) => {
    if (window.confirm('이 기록을 삭제하시겠습니까? 관련 통계에서도 제외됩니다.')) {
      deleteRecord(id);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            측정 기록
          </h2>
          <p className="text-xs text-slate-500">
            총 {records.length}건의 측정 세션이 기록되어 있습니다
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      {uniqueTitles.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4 mb-4">
          <button
            onClick={() => setSelectedTitleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedTitleFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            전체 보기
          </button>
          {uniqueTitles.map((title) => (
            <button
              key={title}
              onClick={() => setSelectedTitleFilter(title)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedTitleFilter === title
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Records List or Empty State */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-card text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Clock size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            저장된 기록이 없습니다
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            타이머를 시작하고 종료하면 자동으로 여기에 기록됩니다.
          </p>
          <button
            onClick={() => setCurrentTab('timer')}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800"
          >
            타이머로 가기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([dateLabel, group]) => {
            const dayTotalSeconds = group.reduce((sum, r) => sum + r.durationSeconds, 0);

            return (
              <div key={dateLabel}>
                {/* Date header */}
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    {dateLabel}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    합계: {formatDurationKorean(dayTotalSeconds)}
                  </span>
                </div>

                {/* List of items */}
                <div className="space-y-2">
                  {group.map((rec) => {
                    return (
                      <div
                        key={rec.id}
                        className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: rec.color || '#3b82f6' }}
                          >
                            <ActivityIcon name={rec.icon || 'Sparkles'} size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {rec.title || '목표 측정'}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {rec.mode === 'countdown' ? '카운트다운' : '스톱워치'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>
                                {formatTimeOnly(rec.startTime)} ~ {formatTimeOnly(rec.endTime)}
                              </span>
                            </div>
                            {rec.notes && (
                              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-start gap-1 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
                                <StickyNote size={11} className="mt-0.5 text-slate-400 shrink-0" />
                                <span className="line-clamp-2">{rec.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pl-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white shrink-0">
                            {formatDurationKorean(rec.durationSeconds)}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => setEditingRecord(rec)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="기록 수정"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(rec.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                              title="기록 삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
