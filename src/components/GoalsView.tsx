import React from 'react';
import {
  CheckCircle2,
  Plus,
  ArrowRight,
  Trophy,
  Flame,
  Sparkles,
  RotateCw,
  SlidersHorizontal,
  CalendarDays,
  Lock,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { ActivityIcon } from './ActivityIcon';
import { CalendarView } from './CalendarView';
import {
  formatDurationKorean,
  formatDateKeyKorean,
  isTodayDate,
  isPastDate,
  addDays,
  getDateKey,
} from '../utils/format';
import { DateGoal } from '../types';

export const GoalsView: React.FC = () => {
  const {
    selectedDateKey,
    setSelectedDateKey,
    getDateGoalsForDate,
    getDateGoalProgress,
    getDateDaySummary,
    rolloverGoal,
    rolloverAllUncompleted,
    setIsGoalModalOpen,
    setEditingGoal,
    setCurrentTab,
    selectGoalForTimer,
  } = useApp();

  const summary = getDateDaySummary(selectedDateKey);
  const isToday = isTodayDate(selectedDateKey);
  const isPast = isPastDate(selectedDateKey);

  const scheduledGoals = getDateGoalsForDate(selectedDateKey);

  const handleStartGoalTimer = (e: React.MouseEvent, goal: DateGoal) => {
    e.stopPropagation();
    selectGoalForTimer(goal);
    setCurrentTab('timer');
  };

  const handleOpenAddGoal = () => {
    if (isPast) {
      alert('이미 지난 과거 날짜에는 목표를 추가할 수 없습니다.');
      return;
    }
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (e: React.MouseEvent, goal: DateGoal) => {
    e.stopPropagation();
    if (isPast) {
      alert('이미 지난 과거 날짜의 목표는 수정할 수 없습니다.');
      return;
    }
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleRolloverOne = (e: React.MouseEvent, goal: DateGoal) => {
    e.stopPropagation();
    if (!isToday) {
      alert('오늘 날짜의 목표만 내일로 이월할 수 있습니다.');
      return;
    }
    const success = rolloverGoal(goal.id);
    if (success) {
      alert(`'${goal.title}'의 미달성 시간이 내일(${formatDateKeyKorean(addDays(selectedDateKey, 1))})로 이월되었습니다.`);
    }
  };

  const handleRolloverAll = () => {
    if (!isToday) {
      alert('오늘 날짜의 목표만 내일로 이월할 수 있습니다.');
      return;
    }
    const nextDateStr = formatDateKeyKorean(addDays(selectedDateKey, 1));
    const count = rolloverAllUncompleted(selectedDateKey);
    if (count > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        console.error(e);
      }
      alert(`오늘 미달성 목표 ${count}개가 내일(${nextDateStr})로 모두 이월되었습니다!`);
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#3b82f6'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            스터디 플래너 & 시간표
          </h2>
          <p className="text-xs text-slate-500">
            날마다 필요한 목표를 자유롭게 계획하고 타이머로 달성하세요
          </p>
        </div>
        {!isPast && (
          <button
            onClick={handleOpenAddGoal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus size={14} />
            목표 추가
          </button>
        )}
      </div>

      {/* Calendar View */}
      <CalendarView />

      {/* Quick Date Switcher Chips */}
      <div className="flex items-center justify-between gap-1.5 mb-5 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedDateKey(addDays(getDateKey(), -1))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDateKey === addDays(getDateKey(), -1)
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            어제
          </button>
          <button
            onClick={() => setSelectedDateKey(getDateKey())}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isToday
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            오늘
          </button>
          <button
            onClick={() => setSelectedDateKey(addDays(getDateKey(), 1))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDateKey === addDays(getDateKey(), 1)
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            내일
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {formatDateKeyKorean(selectedDateKey)}
          </span>
          {isPast && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              <Lock size={10} />
              과거
            </span>
          )}
        </div>
      </div>

      {/* 1. All Goals Completed Visual Celebration Banner */}
      {summary.allCompleted && summary.totalGoalsCount > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-3xl p-5 mb-6 shadow-elevated relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white">
                <Trophy size={13} className="text-yellow-300" />
                목표 100% 달성 완료
              </div>
              <h3 className="text-base font-extrabold tracking-tight">
                대단해요! 설정한 목표를 모두 달성했습니다! 🎉
              </h3>
              <p className="text-xs text-white/90">
                총 집중 시간: <strong>{formatDurationKorean(summary.totalRecordedSeconds)}</strong>
              </p>
            </div>
            <button
              onClick={triggerCelebration}
              className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all transform active:scale-95"
              title="축하 효과"
            >
              <Sparkles size={22} className="text-yellow-200" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Rollover Action Banner: ONLY FOR TODAY! */}
      {isToday && summary.canRollover && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-3xl p-4 mb-6 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <RotateCw size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                오늘 미달성 목표 {summary.uncompletedCount}개 내일로 이월 가능
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                오늘 다 채우지 못한 시간을 내일 시간표로 넘길 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={handleRolloverAll}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs whitespace-nowrap shadow-xs flex items-center gap-1 transition-all active:scale-95"
          >
            <span>내일로 이월</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 3. Empty State or Goals List */}
      {scheduledGoals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-card text-center my-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <CalendarDays size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            {isPast ? '이 날짜에는 등록된 목표가 없습니다' : '이 날짜의 목표 시간표가 비어 있습니다'}
          </h3>
          <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">
            {isPast
              ? '과거 날짜는 기록 조회만 가능하며 새로 목표를 추가할 수 없습니다.'
              : '스터디 플래너처럼 오늘 할 일("~~하기")과 목표 시간을 등록해보세요.'}
          </p>

          {!isPast && (
            <button
              onClick={handleOpenAddGoal}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800"
            >
              + 목표 시간표 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {scheduledGoals.map((goal) => {
            const progress = getDateGoalProgress(goal);
            const isCompleted = progress.isCompleted;

            return (
              <div
                key={goal.id}
                onClick={() => {
                  selectGoalForTimer(goal);
                  setCurrentTab('timer');
                }}
                className={`p-4 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border-emerald-300 dark:border-emerald-700/80 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-card'
                }`}
              >
                {/* Completed Decorative glow */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-16 h-16 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
                )}

                {/* Card Header */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: goal.color }}
                    >
                      <ActivityIcon name={goal.icon} size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {goal.title}
                        </span>

                        {/* HIGH-IMPACT COMPLETION BADGE */}
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs animate-in zoom-in-95 duration-200">
                            <CheckCircle2 size={13} className="stroke-[2.5]" />
                            달성 완료!
                          </span>
                        ) : progress.isRolledOver ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            내일로 이월됨
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span>목표: {formatDurationKorean(goal.targetSeconds)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Play or Edit */}
                  <div className="flex items-center gap-1">
                    {!isPast && (
                      <button
                        onClick={(e) => handleEditGoal(e, goal)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="이 목표 수정 또는 삭제"
                      >
                        <SlidersHorizontal size={15} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleStartGoalTimer(e, goal)}
                      className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                      title="타이머로 측정하기"
                    >
                      <Play size={16} className="fill-current" />
                    </button>
                  </div>
                </div>

                {/* Progress & Stats */}
                <div className="relative z-10">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      진행: <strong className="text-slate-900 dark:text-white font-mono">{formatDurationKorean(progress.recordedSeconds)}</strong>
                    </span>
                    <span
                      className={`font-mono font-extrabold text-sm ${
                        isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {progress.percent}%
                    </span>
                  </div>

                  {/* Progress Bar with Vivid Completion Glow */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm'
                          : ''
                      }`}
                      style={{
                        width: `${Math.min(100, progress.percent)}%`,
                        backgroundColor: isCompleted ? undefined : goal.color,
                      }}
                    />
                  </div>

                  {/* Status Footers */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Flame size={14} className="fill-current" />
                        {progress.overtimeSeconds > 0 ? (
                          <span>+{formatDurationKorean(progress.overtimeSeconds)} 초과 집중 달성!</span>
                        ) : (
                          <span>목표 완벽 달성!</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        남은 시간: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatDurationKorean(progress.uncompletedSeconds)}</strong>
                      </div>
                    )}

                    {/* Single Activity Rollover Button: ONLY TODAY! */}
                    {isToday && !isCompleted && progress.uncompletedSeconds > 0 && !progress.isRolledOver && (
                      <button
                        onClick={(e) => handleRolloverOne(e, goal)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800 transition-colors"
                      >
                        <span>내일로 이월</span>
                        <ArrowRight size={11} />
                      </button>
                    )}

                    {progress.isRolledOver && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        내일로 {formatDurationKorean(progress.uncompletedSeconds)} 이월됨
                      </span>
                    )}

                    {goal.rolledOverFrom && (
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        어제에서 +{formatDurationKorean(goal.rolledOverSeconds || 0)} 이월됨
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
