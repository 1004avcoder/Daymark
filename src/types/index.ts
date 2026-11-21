export type TimerMode = 'stopwatch' | 'countdown';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface DateGoal {
  id: string;
  dateKey: string; // "YYYY-MM-DD"
  title: string; // Custom task title, e.g. "알고리즘 3문제 풀기", "독서 30쪽 읽기"
  color: string;
  icon: string;
  targetSeconds: number; // planned time in seconds
  rolledOverFrom?: string; // dateKey of source date (e.g. "2026-11-21")
  rolledOverSeconds?: number; // seconds carried over from past date
  isRolledOver?: boolean; // whether this date's uncompleted goal was rolled over to next day
  rolledOverTo?: string; // dateKey of destination date (e.g. "2026-11-22")
  createdAt: number;
}

export interface ActiveTimerState {
  dateGoalId?: string; // linked to scheduled task if selected
  taskTitle: string; // task name, e.g. "알고리즘 3문제 풀기"
  color: string;
  icon: string;
  mode: TimerMode;
  targetSeconds: number; // used for countdown or goal target
  startTimestamp: number | null; // initial start time
  currentSegmentStart: number | null; // start time of the current unpaused segment
  accumulatedSeconds: number; // seconds recorded before current unpaused segment
  status: TimerStatus;
  notes?: string;
}

export interface TimeRecord {
  id: string;
  dateGoalId?: string;
  title: string; // task name
  color: string;
  icon: string;
  startTime: number; // ms timestamp
  endTime: number; // ms timestamp
  durationSeconds: number; // total valid elapsed seconds (excluding pauses)
  mode: TimerMode;
  targetSeconds?: number;
  notes?: string;
  createdAt: number;
}

export interface UserSettings {
  weekStartDay: 0 | 1; // 0: Sunday, 1: Monday
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  autoSaveOnTarget: boolean;
}

export type ActiveTab = 'timer' | 'goals' | 'records' | 'stats' | 'settings';
