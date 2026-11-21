import React, { useMemo } from 'react';
import { TrendingUp, Calendar, Clock, Activity as ActivityPulse } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDurationKorean, getWeekRange } from '../utils/format';

export const StatsView: React.FC = () => {
  const { records, todayTotalSeconds, weekTotalSeconds, settings } = useApp();

  // Last 7 days breakdown for bar chart
  const last7DaysData = useMemo(() => {
    const days: { dateStr: string; dayName: string; seconds: number; isToday: boolean }[] = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

      const daySeconds = records
        .filter((r) => r.startTime >= startOfDay && r.startTime <= endOfDay)
        .reduce((sum, r) => sum + r.durationSeconds, 0);

      days.push({
        dateStr: `${d.getMonth() + 1}/${d.getDate()}`,
        dayName: dayNames[d.getDay()],
        seconds: daySeconds,
        isToday: i === 0,
      });
    }

    return days;
  }, [records]);

  const maxDailySeconds = useMemo(() => {
    const max = Math.max(...last7DaysData.map((d) => d.seconds));
    return max > 0 ? max : 3600; // at least 1 hour scale
  }, [last7DaysData]);

  // Task breakdown for this week
  const taskDistribution = useMemo(() => {
    const { start, end } = getWeekRange(settings.weekStartDay);
    const weekRecords = records.filter((r) => r.startTime >= start && r.startTime <= end);
    const total = weekRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

    const taskMap = new Map<string, { seconds: number; color: string }>();

    weekRecords.forEach((r) => {
      const title = r.title || '목표 측정';
      const existing = taskMap.get(title);
      if (existing) {
        existing.seconds += r.durationSeconds;
      } else {
        taskMap.set(title, {
          seconds: r.durationSeconds,
          color: r.color || '#3b82f6',
        });
      }
    });

    const list: { title: string; color: string; seconds: number; percent: number }[] = [];
    taskMap.forEach((val, title) => {
      const percent = total > 0 ? Math.round((val.seconds / total) * 100) : 0;
      list.push({
        title,
        color: val.color,
        seconds: val.seconds,
        percent,
      });
    });

    return list.sort((a, b) => b.seconds - a.seconds);
  }, [records, settings.weekStartDay]);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          통계 및 분석
        </h2>
        <p className="text-xs text-slate-500">
          누적된 측정 기록을 바탕으로 분석된 데이터입니다
        </p>
      </div>

      {/* Overview Cards (Today & Week) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
            <Clock size={14} className="text-indigo-500" />
            <span>오늘 총 시간</span>
          </div>
          <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
            {formatDurationKorean(todayTotalSeconds)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
            <Calendar size={14} className="text-emerald-500" />
            <span>이번 주 누적</span>
          </div>
          <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
            {formatDurationKorean(weekTotalSeconds)}
          </div>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              최근 7일 측정 추이
            </span>
          </div>
          <span className="text-xs text-slate-400">일별 집중 시간</span>
        </div>

        <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1">
          {last7DaysData.map((d) => {
            const heightPercent = maxDailySeconds > 0 ? (d.seconds / maxDailySeconds) * 100 : 0;
            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                  {formatDurationKorean(d.seconds)}
                </span>
                <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-lg h-full flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      d.isToday
                        ? 'bg-indigo-600 dark:bg-indigo-500'
                        : d.seconds > 0
                        ? 'bg-slate-800 dark:bg-slate-300'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium ${
                    d.isToday
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Activity Distribution */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ActivityPulse size={16} className="text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              이번 주 목표별 집중 비중
            </span>
          </div>
        </div>

        {taskDistribution.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            이번 주 측정된 활동 기록이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Multi-segment stacked bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              {taskDistribution.map((item) => (
                <div
                  key={item.title}
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.title}: ${item.percent}%`}
                />
              ))}
            </div>

            {/* Legend and details */}
            <div className="space-y-2 pt-2">
              {taskDistribution.map((item) => (
                <div key={item.title} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-500 font-mono">
                      {formatDurationKorean(item.seconds)}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 w-10 text-right">
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
