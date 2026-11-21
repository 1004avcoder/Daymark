import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveTimerState,
  TimeRecord,
  UserSettings,
  ActiveTab,
  TimerMode,
  DateGoal,
} from '../types';
import { storage } from '../utils/storage';
import {
  getTodayRange,
  getWeekRange,
  getDateKey,
  getDayRangeForDateKey,
  addDays,
  isTodayDate,
  isPastDate,
} from '../utils/format';

export interface DateGoalProgress {
  goal: DateGoal;
  recordedSeconds: number;
  percent: number;
  isCompleted: boolean;
  overtimeSeconds: number;
  uncompletedSeconds: number;
  isRolledOver: boolean;
}

export interface DateDaySummary {
  totalGoalsCount: number;
  completedGoalsCount: number;
  allCompleted: boolean;
  totalTargetSeconds: number;
  totalRecordedSeconds: number;
  uncompletedCount: number;
  canRollover: boolean;
}

interface AppContextType {
  records: TimeRecord[];
  addRecord: (record: Omit<TimeRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, updates: Partial<TimeRecord>) => void;
  deleteRecord: (id: string) => void;

  // Active Timer state and live values
  activeTimer: ActiveTimerState;
  elapsedSeconds: number;
  remainingSeconds: number;
  isGoalReached: boolean;

  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (notes?: string) => void;
  cancelTimer: () => void;
  setMode: (mode: TimerMode) => void;
  setTargetSeconds: (seconds: number) => void;
  selectGoalForTimer: (goal: DateGoal) => void;
  setCustomTimerTask: (taskTitle: string, color?: string, icon?: string, targetSeconds?: number) => void;

  // Date-Specific Goals & Rollover (Study Planner)
  dateGoals: DateGoal[];
  selectedDateKey: string;
  setSelectedDateKey: (dateKey: string) => void;
  getDateGoalsForDate: (dateKey: string) => DateGoal[];
  addDateGoal: (dateKey: string, data: { title: string; color: string; icon: string; targetSeconds: number }) => boolean;
  updateDateGoal: (id: string, updates: Partial<DateGoal>) => boolean;
  deleteDateGoal: (id: string) => boolean;
  rolloverGoal: (id: string) => boolean;
  rolloverAllUncompleted: (dateKey: string) => number;
  getDateGoalProgress: (goal: DateGoal) => DateGoalProgress;
  getDateDaySummary: (dateKey: string) => DateDaySummary;

  // Settings
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  // Navigation & Modals
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  editingRecord: TimeRecord | null;
  setEditingRecord: (record: TimeRecord | null) => void;

  // Study Planner Goal Modal
  isGoalModalOpen: boolean;
  setIsGoalModalOpen: (open: boolean) => void;
  editingGoal: DateGoal | null;
  setEditingGoal: (goal: DateGoal | null) => void;

  // Stats
  todayTotalSeconds: number;
  weekTotalSeconds: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<TimeRecord[]>(() => storage.getRecords());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState>(() => storage.getActiveTimer());
  const [dateGoals, setDateGoals] = useState<DateGoal[]>(() => storage.getDateGoals());

  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => getDateKey());

  const [currentTab, setCurrentTab] = useState<ActiveTab>('timer');
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<DateGoal | null>(null);

  // Live elapsed counter state updated via requestAnimationFrame
  const [liveElapsed, setLiveElapsed] = useState<number>(() => {
    const t = activeTimer;
    if (t.status === 'running' && t.currentSegmentStart) {
      const delta = Math.floor((Date.now() - t.currentSegmentStart) / 1000);
      return t.accumulatedSeconds + Math.max(0, delta);
    }
    return t.accumulatedSeconds;
  });

  const celebrationTriggeredRef = useRef(false);

  // Save changes to storage
  useEffect(() => {
    storage.saveRecords(records);
  }, [records]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storage.saveActiveTimer(activeTimer);
  }, [activeTimer]);

  useEffect(() => {
    storage.saveDateGoals(dateGoals);
  }, [dateGoals]);

  // High precision timer loop based on absolute timestamps
  useEffect(() => {
    let animId: number;
    const updateTime = () => {
      if (activeTimer.status === 'running' && activeTimer.currentSegmentStart) {
        const delta = Math.floor((Date.now() - activeTimer.currentSegmentStart) / 1000);
        const currentElapsed = activeTimer.accumulatedSeconds + Math.max(0, delta);
        setLiveElapsed(currentElapsed);
      } else {
        setLiveElapsed(activeTimer.accumulatedSeconds);
      }
      animId = requestAnimationFrame(updateTime);
    };

    animId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animId);
  }, [activeTimer]);


  // Get all scheduled goals for a given date
  const getDateGoalsForDate = useCallback(
    (dateKey: string): DateGoal[] => {
      return dateGoals.filter((dg) => dg.dateKey === dateKey);
    },
    [dateGoals]
  );

  // Add goal on a date (NO past dates!)
  const addDateGoal = useCallback(
    (dateKey: string, data: { title: string; color: string; icon: string; targetSeconds: number }): boolean => {
      if (isPastDate(dateKey)) {
        alert('이미 지난 과거 날짜에는 목표를 추가할 수 없습니다.');
        return false;
      }

      const newGoal: DateGoal = {
        id: `dg-${dateKey}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dateKey,
        title: data.title.trim(),
        color: data.color || '#3b82f6',
        icon: data.icon || 'Sparkles',
        targetSeconds: Math.max(0, data.targetSeconds),
        createdAt: Date.now(),
      };

      setDateGoals((prev) => [...prev, newGoal]);
      return true;
    },
    []
  );

  // Update goal (NO past dates!)
  const updateDateGoal = useCallback(
    (id: string, updates: Partial<DateGoal>): boolean => {
      const existing = dateGoals.find((g) => g.id === id);
      if (!existing || isPastDate(existing.dateKey)) {
        alert('이미 지난 날짜의 목표는 수정할 수 없습니다.');
        return false;
      }

      setDateGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
      return true;
    },
    [dateGoals]
  );

  // Delete goal (NO past dates!)
  const deleteDateGoal = useCallback(
    (id: string): boolean => {
      const existing = dateGoals.find((g) => g.id === id);
      if (!existing || isPastDate(existing.dateKey)) {
        alert('이미 지난 날짜의 목표는 삭제할 수 없습니다.');
        return false;
      }
      setDateGoals((prev) => prev.filter((g) => g.id !== id));
      return true;
    },
    [dateGoals]
  );

  // Calculate progress for an individual DateGoal
  const getDateGoalProgress = useCallback(
    (goal: DateGoal): DateGoalProgress => {
      const { start, end } = getDayRangeForDateKey(goal.dateKey);
      const isToday = isTodayDate(goal.dateKey);

      // Match recorded time for this goal by dateGoalId OR title
      let recordedSeconds = records
        .filter((r) => {
          const withinDay = r.startTime >= start && r.startTime <= end;
          if (!withinDay) return false;
          return r.dateGoalId === goal.id || r.title === goal.title;
        })
        .reduce((sum, r) => sum + r.durationSeconds, 0);

      // If active timer is running on this goal today, include live elapsed
      if (
        isToday &&
        activeTimer.status !== 'idle' &&
        (activeTimer.dateGoalId === goal.id || activeTimer.taskTitle === goal.title)
      ) {
        recordedSeconds += liveElapsed;
      }

      const percent = goal.targetSeconds > 0 ? Math.round((recordedSeconds / goal.targetSeconds) * 100) : 0;
      const isCompleted = goal.targetSeconds > 0 && recordedSeconds >= goal.targetSeconds;
      const overtimeSeconds = isCompleted ? Math.max(0, recordedSeconds - goal.targetSeconds) : 0;
      const uncompletedSeconds = !isCompleted && goal.targetSeconds > 0 ? Math.max(0, goal.targetSeconds - recordedSeconds) : 0;

      return {
        goal,
        recordedSeconds,
        percent,
        isCompleted,
        overtimeSeconds,
        uncompletedSeconds,
        isRolledOver: Boolean(goal.isRolledOver),
      };
    },
    [records, activeTimer.status, activeTimer.dateGoalId, activeTimer.taskTitle, liveElapsed]
  );

  // Rollover an individual goal: ONLY TODAY CAN ROLL OVER!
  const rolloverGoal = useCallback(
    (id: string): boolean => {
      const existing = dateGoals.find((g) => g.id === id);
      if (!existing || !isTodayDate(existing.dateKey)) {
        alert('오늘 날짜의 목표만 내일로 이월할 수 있습니다.');
        return false;
      }

      const progress = getDateGoalProgress(existing);
      if (progress.isCompleted || progress.uncompletedSeconds <= 0 || progress.isRolledOver) {
        return false;
      }

      const nextDayKey = addDays(existing.dateKey, 1);

      setDateGoals((prev) => {
        let list = [...prev];
        // 1. Mark current goal as rolled over
        const curIdx = list.findIndex((g) => g.id === id);
        if (curIdx >= 0) {
          list[curIdx] = {
            ...list[curIdx],
            isRolledOver: true,
            rolledOverTo: nextDayKey,
          };
        }

        // 2. Add to tomorrow's schedule
        const newTomorrowGoal: DateGoal = {
          id: `dg-${nextDayKey}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          dateKey: nextDayKey,
          title: existing.title,
          color: existing.color,
          icon: existing.icon,
          targetSeconds: progress.uncompletedSeconds,
          rolledOverFrom: existing.dateKey,
          rolledOverSeconds: progress.uncompletedSeconds,
          createdAt: Date.now(),
        };

        list.push(newTomorrowGoal);
        return list;
      });

      return true;
    },
    [dateGoals, getDateGoalProgress]
  );

  // Rollover all uncompleted goals for a dateKey: ONLY TODAY!
  const rolloverAllUncompleted = useCallback(
    (dateKey: string): number => {
      if (!isTodayDate(dateKey)) {
        alert('오늘 날짜의 목표만 내일로 이월할 수 있습니다.');
        return 0;
      }

      let count = 0;
      const goals = getDateGoalsForDate(dateKey);
      goals.forEach((g) => {
        const p = getDateGoalProgress(g);
        if (!p.isCompleted && p.uncompletedSeconds > 0 && !p.isRolledOver) {
          rolloverGoal(g.id);
          count++;
        }
      });
      return count;
    },
    [getDateGoalsForDate, getDateGoalProgress, rolloverGoal]
  );

  // Get summary of goals for a dateKey
  const getDateDaySummary = useCallback(
    (dateKey: string): DateDaySummary => {
      const goals = getDateGoalsForDate(dateKey);
      let totalGoalsCount = 0;
      let completedGoalsCount = 0;
      let totalTargetSeconds = 0;
      let totalRecordedSeconds = 0;
      let uncompletedCount = 0;

      goals.forEach((g) => {
        const p = getDateGoalProgress(g);
        totalGoalsCount++;
        totalTargetSeconds += g.targetSeconds;
        totalRecordedSeconds += p.recordedSeconds;
        if (p.isCompleted) {
          completedGoalsCount++;
        } else if (!p.isRolledOver && p.uncompletedSeconds > 0) {
          uncompletedCount++;
        }
      });

      const allCompleted = totalGoalsCount > 0 && completedGoalsCount === totalGoalsCount;
      const canRollover = isTodayDate(dateKey) && uncompletedCount > 0;

      return {
        totalGoalsCount,
        completedGoalsCount,
        allCompleted,
        totalTargetSeconds,
        totalRecordedSeconds,
        uncompletedCount,
        canRollover,
      };
    },
    [getDateGoalsForDate, getDateGoalProgress]
  );

  // Check goal reached (daily goal or countdown target)
  const isGoalReached = useMemo(() => {
    if (activeTimer.mode === 'countdown') {
      return liveElapsed >= activeTimer.targetSeconds;
    }
    if (activeTimer.targetSeconds > 0) {
      return liveElapsed >= activeTimer.targetSeconds;
    }
    return false;
  }, [activeTimer.mode, activeTimer.targetSeconds, liveElapsed]);

  // Confetti effect when goal is first reached during active timer
  useEffect(() => {
    if (isGoalReached && activeTimer.status === 'running' && !celebrationTriggeredRef.current) {
      celebrationTriggeredRef.current = true;
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899'],
        });
      } catch (e) {
        console.error(e);
      }
    } else if (!isGoalReached || activeTimer.status === 'idle') {
      celebrationTriggeredRef.current = false;
    }
  }, [isGoalReached, activeTimer.status]);

  // Timer actions
  const selectGoalForTimer = useCallback((goal: DateGoal) => {
    if (activeTimer.status !== 'idle') return;
    setActiveTimer((prev) => ({
      ...prev,
      dateGoalId: goal.id,
      taskTitle: goal.title,
      color: goal.color,
      icon: goal.icon,
      targetSeconds: goal.targetSeconds || 1500,
    }));
  }, [activeTimer.status]);

  const setCustomTimerTask = useCallback(
    (taskTitle: string, color?: string, icon?: string, targetSeconds?: number) => {
      if (activeTimer.status !== 'idle') return;
      setActiveTimer((prev) => ({
        ...prev,
        dateGoalId: undefined,
        taskTitle: taskTitle.trim() || '목표 측정',
        color: color || prev.color || '#3b82f6',
        icon: icon || prev.icon || 'Sparkles',
        targetSeconds: targetSeconds !== undefined ? targetSeconds : prev.targetSeconds,
      }));
    },
    [activeTimer.status]
  );

  const startTimer = useCallback(() => {
    const now = Date.now();
    setActiveTimer((prev) => ({
      ...prev,
      startTimestamp: now,
      currentSegmentStart: now,
      accumulatedSeconds: 0,
      status: 'running',
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    const now = Date.now();
    setActiveTimer((prev) => {
      if (prev.status !== 'running' || !prev.currentSegmentStart) return prev;
      const segmentElapsed = Math.floor((now - prev.currentSegmentStart) / 1000);
      return {
        ...prev,
        status: 'paused',
        accumulatedSeconds: prev.accumulatedSeconds + Math.max(0, segmentElapsed),
        currentSegmentStart: null,
      };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    const now = Date.now();
    setActiveTimer((prev) => {
      if (prev.status !== 'paused') return prev;
      return {
        ...prev,
        status: 'running',
        currentSegmentStart: now,
      };
    });
  }, []);

  const stopTimer = useCallback((notes?: string) => {
    const now = Date.now();
    let finalDuration = activeTimer.accumulatedSeconds;
    if (activeTimer.status === 'running' && activeTimer.currentSegmentStart) {
      finalDuration += Math.max(0, Math.floor((now - activeTimer.currentSegmentStart) / 1000));
    }

    if (finalDuration >= 3) {
      const newRecord: TimeRecord = {
        id: 'rec-' + now + '-' + Math.random().toString(36).substring(2, 7),
        dateGoalId: activeTimer.dateGoalId,
        title: activeTimer.taskTitle,
        color: activeTimer.color,
        icon: activeTimer.icon,
        startTime: activeTimer.startTimestamp || (now - finalDuration * 1000),
        endTime: now,
        durationSeconds: finalDuration,
        mode: activeTimer.mode,
        targetSeconds: activeTimer.targetSeconds,
        notes: notes || undefined,
        createdAt: now,
      };
      setRecords((prev) => [newRecord, ...prev]);
    }

    setActiveTimer((prev) => ({
      ...prev,
      status: 'idle',
      startTimestamp: null,
      currentSegmentStart: null,
      accumulatedSeconds: 0,
      notes: undefined,
    }));
  }, [activeTimer]);

  const cancelTimer = useCallback(() => {
    setActiveTimer((prev) => ({
      ...prev,
      status: 'idle',
      startTimestamp: null,
      currentSegmentStart: null,
      accumulatedSeconds: 0,
      notes: undefined,
    }));
  }, []);

  const setMode = useCallback((mode: TimerMode) => {
    if (activeTimer.status !== 'idle') return;
    setActiveTimer((prev) => ({ ...prev, mode }));
  }, [activeTimer.status]);

  const setTargetSeconds = useCallback((targetSeconds: number) => {
    if (activeTimer.status !== 'idle') return;
    setActiveTimer((prev) => ({ ...prev, targetSeconds }));
  }, [activeTimer.status]);

  // Record management
  const addRecord = useCallback((data: Omit<TimeRecord, 'id' | 'createdAt'>) => {
    const now = Date.now();
    const newRecord: TimeRecord = {
      ...data,
      id: 'rec-' + now + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: now,
    };
    setRecords((prev) => [newRecord, ...prev]);
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<TimeRecord>) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Stats calculations
  const todayTotalSeconds = useMemo(() => {
    const { start, end } = getTodayRange();
    return records
      .filter((r) => r.startTime >= start && r.startTime <= end)
      .reduce((sum, r) => sum + r.durationSeconds, 0);
  }, [records]);

  const weekTotalSeconds = useMemo(() => {
    const { start, end } = getWeekRange(settings.weekStartDay);
    return records
      .filter((r) => r.startTime >= start && r.startTime <= end)
      .reduce((sum, r) => sum + r.durationSeconds, 0);
  }, [records, settings.weekStartDay]);

  const remainingSeconds = useMemo(() => {
    if (activeTimer.mode !== 'countdown') return 0;
    return Math.max(0, activeTimer.targetSeconds - liveElapsed);
  }, [activeTimer.mode, activeTimer.targetSeconds, liveElapsed]);

  return (
    <AppContext.Provider
      value={{
        records,
        addRecord,
        updateRecord,
        deleteRecord,
        activeTimer,
        elapsedSeconds: liveElapsed,
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
        dateGoals,
        selectedDateKey,
        setSelectedDateKey,
        getDateGoalsForDate,
        addDateGoal,
        updateDateGoal,
        deleteDateGoal,
        rolloverGoal,
        rolloverAllUncompleted,
        getDateGoalProgress,
        getDateDaySummary,
        settings,
        updateSettings,
        currentTab,
        setCurrentTab,
        editingRecord,
        setEditingRecord,
        isGoalModalOpen,
        setIsGoalModalOpen,
        editingGoal,
        setEditingGoal,
        todayTotalSeconds,
        weekTotalSeconds,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
