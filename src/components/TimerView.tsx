import React, { useState } from 'react';
import { Play, Pause, Square, RotateCcw, CheckCircle2, Plus, AlertTriangle, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityIcon } from './ActivityIcon';
import { formatSeconds, formatDurationKorean, getDateKey } from '../utils/format';

export const TimerView: React.FC = () => {
  const {
    activeTimer,
    elapsedSeconds,
    remainingSeconds,
    isGoalReached,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    setMode,
    setTargetSeconds,
    selectGoalForTimer,
    setCustomTimerTask,
    getDateGoalsForDate,
    getDateGoalProgress,
    setCurrentTab,
    setIsGoalModalOpen,
  } = useApp();

  const [notesInput, setNotesInput] = useState('');
  const [showStopModal, setShowStopModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [isEditingTaskTitle, setIsEditingTaskTitle] = useState(false);
  const [tempTaskTitle, setTempTaskTitle] = useState('');

  const isIdle = activeTimer.status === 'idle';
  const isRunning = activeTimer.status === 'running';
  const isPaused = activeTimer.status === 'paused';
  const isCountdown = activeTimer.mode === 'countdown';

  // Today's scheduled goals from study planner
  const todayGoals = getDateGoalsForDate(getDateKey());
  const activeDateGoal = todayGoals.find((g) => g.id === activeTimer.dateGoalId);
  const goalProgress = activeDateGoal ? getDateGoalProgress(activeDateGoal) : null;

  // Countdown presets
  const presets = [
    { label: '15분', seconds: 15 * 60 },
    { label: '25분', seconds: 25 * 60 },
    { label: '30분', seconds: 30 * 60 },
    { label: '50분', seconds: 50 * 60 },
    { label: '60분', seconds: 60 * 60 },
  ];

  const handleStart = () => {
    startTimer();
  };

  const handleStopClick = () => {
    setShowStopModal(true);
  };

  const handleConfirmStop = () => {
    stopTimer(notesInput.trim() || undefined);
    setNotesInput('');
    setShowStopModal(false);
  };

  const handleResetClick = () => {
    setShowResetConfirmModal(true);
  };

  const handleConfirmReset = () => {
    cancelTimer();
    setShowResetConfirmModal(false);
  };

  const handleQuickPreset = (sec: number) => {
    if (!isIdle) return;
    setTargetSeconds(sec);
  };

  const handleCustomMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomMinutes(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setTargetSeconds(num * 60);
    }
  };

  const handleApplyCustomTaskTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTaskTitle.trim()) {
      setCustomTimerTask(tempTaskTitle.trim());
      setIsEditingTaskTitle(false);
    }
  };

  // Determine display time
  let displayTime = '';
  if (isCountdown) {
    if (elapsedSeconds >= activeTimer.targetSeconds) {
      const overtime = elapsedSeconds - activeTimer.targetSeconds;
      displayTime = `+${formatSeconds(overtime, true)}`;
    } else {
      displayTime = formatSeconds(remainingSeconds, true);
    }
  } else {
    displayTime = formatSeconds(elapsedSeconds, true);
  }

  // Calculate percentage
  let progressPercentage = 0;
  if (isCountdown) {
    progressPercentage = activeTimer.targetSeconds > 0
      ? Math.min(100, Math.round((elapsedSeconds / activeTimer.targetSeconds) * 100))
      : 0;
  } else if (goalProgress && goalProgress.goal.targetSeconds > 0) {
    progressPercentage = Math.min(100, goalProgress.percent);
  } else if (activeTimer.targetSeconds > 0) {
    progressPercentage = Math.min(100, Math.round((elapsedSeconds / activeTimer.targetSeconds) * 100));
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 flex flex-col items-center">
      {/* Mode Switcher: Stopwatch vs Countdown */}
      <div className="w-full bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl flex items-center mb-5 shadow-inner">
        <button
          disabled={!isIdle}
          onClick={() => setMode('stopwatch')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            !isCountdown
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-50'
          }`}
        >
          스톱워치
        </button>
        <button
          disabled={!isIdle}
          onClick={() => setMode('countdown')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            isCountdown
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-50'
          }`}
        >
          카운트다운
        </button>
      </div>

      {/* Task & Goal Selection (Study Planner integration) */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Target size={13} className="text-indigo-600" />
            측정할 목표 선택
          </span>
          {isIdle && (
            <button
              onClick={() => {
                setTempTaskTitle(activeTimer.taskTitle);
                setIsEditingTaskTitle(true);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              직접 입력
            </button>
          )}
        </div>

        {/* Today's scheduled goals scrollable chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4">
          {todayGoals.map((g) => {
            const isSelected = activeTimer.dateGoalId === g.id;
            return (
              <button
                key={g.id}
                disabled={!isIdle}
                onClick={() => selectGoalForTimer(g)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-900/20 dark:border-white/20 shadow-subtle ring-2 ring-slate-900/5'
                    : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-800 hover:bg-white disabled:opacity-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                <ActivityIcon name={g.icon} size={14} />
                <span>{g.title}</span>
              </button>
            );
          })}

          {todayGoals.length === 0 && (
            <div className="text-xs text-slate-400 py-1 flex items-center gap-2">
              <span>오늘 시간표에 등록된 목표가 없습니다.</span>
              <button
                onClick={() => {
                  setCurrentTab('goals');
                  setIsGoalModalOpen(true);
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
              >
                <Plus size={12} />
                목표 추가하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Countdown Presets (Only when in countdown & idle) */}
      {isCountdown && isIdle && (
        <div className="w-full bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs mb-6">
          <div className="text-[11px] font-medium text-slate-500 mb-2">목표 시간 설정</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {presets.map((p) => {
              const isSelected = activeTimer.targetSeconds === p.seconds;
              return (
                <button
                  key={p.seconds}
                  onClick={() => handleQuickPreset(p.seconds)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700 text-xs">
            <span className="text-slate-500">직접 입력:</span>
            <input
              type="text"
              inputMode="numeric"
              value={customMinutes}
              onChange={handleCustomMinuteChange}
              className="w-14 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-semibold text-slate-900 dark:text-white"
            />
            <span className="text-slate-500">분</span>
          </div>
        </div>
      )}

      {/* Main Timer Display Card */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col items-center justify-center relative overflow-hidden mb-6">
        {/* Subtle Background Glow when running */}
        {isRunning && (
          <div
            className="absolute inset-0 opacity-5 blur-2xl pointer-events-none transition-all duration-1000"
            style={{ backgroundColor: activeTimer.color || '#6366f1' }}
          />
        )}

        {/* Status Indicator Badge */}
        <div className="mb-4">
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              측정 중
            </span>
          )}
          {isPaused && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              일시정지됨
            </span>
          )}
          {isIdle && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              준비 완료
            </span>
          )}
        </div>

        {/* Selected Task Title Label */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTimer.color }} />
          <ActivityIcon name={activeTimer.icon} size={15} />
          <span className="text-base font-bold text-slate-800 dark:text-slate-200">
            {activeTimer.taskTitle}
          </span>
        </div>

        {/* Huge Time Digits */}
        <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white my-3 select-none tabular-nums">
          {displayTime}
        </div>

        {/* Goal Reached & Overtime Notification */}
        {isGoalReached && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-bounce">
            <CheckCircle2 size={13} />
            <span>목표 달성! 초과 시간 누적 중</span>
          </div>
        )}

        {/* Progress bar towards target */}
        <div className="w-full mt-6">
          <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1.5">
            <span>
              {isCountdown
                ? `목표: ${formatDurationKorean(activeTimer.targetSeconds)}`
                : goalProgress?.goal.targetSeconds
                ? `오늘 목표: ${formatDurationKorean(goalProgress.goal.targetSeconds)}`
                : '오늘 측정 시간'}
            </span>
            <span className="font-medium font-mono text-slate-700 dark:text-slate-300">
              {isCountdown
                ? `${progressPercentage}%`
                : goalProgress?.goal.targetSeconds
                ? `${formatDurationKorean(goalProgress.recordedSeconds)} (${goalProgress.percent}%)`
                : formatDurationKorean(elapsedSeconds)}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(100, progressPercentage)}%`,
                backgroundColor: isGoalReached ? '#10b981' : activeTimer.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="w-full flex items-center gap-3">
        {isIdle && (
          <button
            onClick={handleStart}
            className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-semibold text-base shadow-elevated flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98]"
          >
            <Play size={20} className="fill-current" />
            <span>측정 시작</span>
          </button>
        )}

        {isRunning && (
          <>
            <button
              onClick={pauseTimer}
              className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-elevated flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] whitespace-nowrap"
            >
              <Pause size={20} className="fill-current" />
              <span>일시정지</span>
            </button>
            <button
              onClick={handleStopClick}
              className="py-4 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all whitespace-nowrap"
            >
              <Square size={18} className="fill-current" />
              <span>종료</span>
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resumeTimer}
              className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-elevated flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] whitespace-nowrap"
            >
              <Play size={20} className="fill-current" />
              <span>재개</span>
            </button>
            <button
              onClick={handleStopClick}
              className="py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap"
            >
              <Square size={18} className="fill-current" />
              <span>종료 및 저장</span>
            </button>
            {/* RESET / CANCEL BUTTON: OPENS IN-SITE CONFIRMATION MODAL */}
            <button
              onClick={handleResetClick}
              title="측정 초기화"
              className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}
      </div>

      {/* 1. IN-SITE RESET CONFIRMATION MODAL (사이트 내 확인 메시지) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevated animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              측정을 초기화하시겠습니까?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              지금까지 측정한 <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{formatSeconds(elapsedSeconds)}</strong>이 저장되지 않고 완전히 삭제됩니다.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                취소 (계속 유지)
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                초기화 (삭제)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Stop & Save Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevated animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              측정 기록 완료
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              측정된 시간: <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{formatSeconds(elapsedSeconds)}</strong>
            </p>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                메모 (선택사항)
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="오늘 어떤 내용을 진행했나요? (예: 1~3단원 문제 풀이)"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStopModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                계속 측정
              </button>
              <button
                onClick={handleConfirmStop}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800"
              >
                기록 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Direct Task Title Editing Modal */}
      {isEditingTaskTitle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevated animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              측정할 목표 직접 입력
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              오늘 시간표에 없더라도 원하는 활동명을 자유롭게 적어 바로 측정할 수 있습니다.
            </p>

            <form onSubmit={handleApplyCustomTaskTitle} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={tempTaskTitle}
                  onChange={(e) => setTempTaskTitle(e.target.value)}
                  placeholder="예: 영어 에세이 작성, 자바스크립트 스터디"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTaskTitle(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800"
                >
                  적용
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
