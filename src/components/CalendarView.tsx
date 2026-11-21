import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getDateKey,
  parseDateKey,
  formatDateKeyKorean,
  isPastDate,
  isTodayDate,
} from '../utils/format';

export const CalendarView: React.FC = () => {
  const { selectedDateKey, setSelectedDateKey, settings, getDateDaySummary } = useApp();

  // Current month displayed in calendar view
  const [viewDate, setViewDate] = useState<Date>(() => parseDateKey(selectedDateKey));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  // Change month
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(getDateKey(today));
  };

  // Weekday headers based on weekStartDay
  const weekDays = useMemo(() => {
    const daysMonStart = ['월', '화', '수', '목', '금', '토', '일'];
    const daysSunStart = ['일', '월', '화', '수', '목', '금', '토'];
    return settings.weekStartDay === 1 ? daysMonStart : daysSunStart;
  }, [settings.weekStartDay]);

  // Calendar cells generation
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sun, 1 is Mon
    if (settings.weekStartDay === 1) {
      // 1 (Mon) -> 0, 2 (Tue) -> 1, ..., 0 (Sun) -> 6
      startDayOfWeek = (startDayOfWeek + 6) % 7;
    }

    const cells: { dateKey: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      cells.push({
        dateKey: getDateKey(prevDate),
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const curDate = new Date(year, month, d);
      cells.push({
        dateKey: getDateKey(curDate),
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete weeks (multiples of 7)
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(year, month + 1, d);
        cells.push({
          dateKey: getDateKey(nextDate),
          dayNumber: d,
          isCurrentMonth: false,
        });
      }
    }

    return cells;
  }, [year, month, settings.weekStartDay]);

  const selectedSummary = useMemo(() => {
    return getDateDaySummary(selectedDateKey);
  }, [getDateDaySummary, selectedDateKey]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card mb-6">
      {/* Month Navigation & Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {year}년 {month + 1}월
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleGoToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors mr-1"
          >
            오늘
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="이전 달"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="다음 달"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDays.map((wd, idx) => {
          const isSunday = (settings.weekStartDay === 1 && idx === 6) || (settings.weekStartDay === 0 && idx === 0);
          const isSaturday = (settings.weekStartDay === 1 && idx === 5) || (settings.weekStartDay === 0 && idx === 6);
          return (
            <div
              key={wd}
              className={`text-[11px] font-semibold py-1 ${
                isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              {wd}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarCells.map((cell) => {
          const isSelected = cell.dateKey === selectedDateKey;
          const isToday = isTodayDate(cell.dateKey);
          const summary = getDateDaySummary(cell.dateKey);

          return (
            <button
              key={cell.dateKey}
              onClick={() => {
                setSelectedDateKey(cell.dateKey);
                // Also update viewDate month if clicking adjacent month day
                const parsed = parseDateKey(cell.dateKey);
                if (parsed.getMonth() !== month) {
                  setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
                }
              }}
              className={`relative h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-subtle z-10'
                  : cell.isCurrentMonth
                  ? isToday
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              <span className="text-xs leading-none">{cell.dayNumber}</span>

              {/* Status Indicator Dot/Badge */}
              <div className="h-2 flex items-center justify-center mt-1">
                {summary.totalGoalsCount > 0 && (
                  <>
                    {summary.allCompleted ? (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-emerald-400' : 'bg-emerald-500 ring-1 ring-emerald-300'
                        }`}
                        title="전체 목표 달성 완료"
                      />
                    ) : summary.completedGoalsCount > 0 ? (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-indigo-300' : 'bg-indigo-500'
                        }`}
                        title="일부 목표 달성"
                      />
                    ) : summary.canRollover ? (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-amber-300' : 'bg-amber-500'
                        }`}
                        title="오늘 미달성 목표 있음 (이월 가능)"
                      />
                    ) : (
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white/40' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Date Header Ribbon */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white">
            {formatDateKeyKorean(selectedDateKey)}
          </span>
          {isTodayDate(selectedDateKey) && (
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold text-[10px]">
              오늘
            </span>
          )}
          {isPastDate(selectedDateKey) && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium text-[10px]">
              지난 날
            </span>
          )}
        </div>

        <div className="text-slate-500 text-[11px] font-medium">
          목표 {selectedSummary.completedGoalsCount}/{selectedSummary.totalGoalsCount}개 완료
          {selectedSummary.allCompleted && ' 🎉'}
        </div>
      </div>
    </div>
  );
};
