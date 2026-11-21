import { ActiveTimerState, TimeRecord, UserSettings, DateGoal } from '../types';

export const DEFAULT_PRESET_TASKS = [
  { title: '공부하기', icon: 'BookOpen', color: '#3b82f6' },
  { title: '독서하기', icon: 'BookMarked', color: '#10b981' },
  { title: '코딩하기', icon: 'Code', color: '#8b5cf6' },
  { title: '운동하기', icon: 'Flame', color: '#f97316' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  weekStartDay: 1, // 월요일 시작
  theme: 'light',
  soundEnabled: true,
  autoSaveOnTarget: false,
};

export const DEFAULT_TIMER_STATE: ActiveTimerState = {
  dateGoalId: undefined,
  taskTitle: '공부하기',
  color: '#3b82f6',
  icon: 'BookOpen',
  mode: 'stopwatch',
  targetSeconds: 1500, // 기본 25분 (카운트다운용)
  startTimestamp: null,
  currentSegmentStart: null,
  accumulatedSeconds: 0,
  status: 'idle',
};

const STORAGE_KEYS = {
  RECORDS: 'daymark_records_v2',
  ACTIVE_TIMER: 'daymark_active_timer_v2',
  SETTINGS: 'daymark_settings_v2',
  DATE_GOALS: 'daymark_date_goals_v2',
};

export const storage = {
  getDateGoals: (): DateGoal[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DATE_GOALS);
      if (data) return JSON.parse(data);
      // Migration from v1 if present
      const v1 = localStorage.getItem('daymark_date_goals_v1');
      if (v1) {
        const parsed = JSON.parse(v1);
        return parsed.map((item: any) => ({
          ...item,
          title: item.title || (item.activityId === 'act-study' ? '공부하기' : item.activityId === 'act-reading' ? '독서하기' : item.activityId === 'act-coding' ? '코딩하기' : item.activityId === 'act-workout' ? '운동하기' : '목표 활동'),
          color: item.color || '#3b82f6',
          icon: item.icon || 'Sparkles',
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  saveDateGoals: (goals: DateGoal[]) => {
    localStorage.setItem(STORAGE_KEYS.DATE_GOALS, JSON.stringify(goals));
  },

  getRecords: (): TimeRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (data) return JSON.parse(data);
      const v1 = localStorage.getItem('daymark_records_v1');
      if (v1) {
        const parsed = JSON.parse(v1);
        return parsed.map((item: any) => ({
          ...item,
          title: item.title || (item.activityId === 'act-study' ? '공부하기' : item.activityId === 'act-reading' ? '독서하기' : item.activityId === 'act-coding' ? '코딩하기' : item.activityId === 'act-workout' ? '운동하기' : '측정 기록'),
          color: item.color || '#3b82f6',
          icon: item.icon || 'Clock',
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  saveRecords: (records: TimeRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  getActiveTimer: (): ActiveTimerState => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
      return data ? { ...DEFAULT_TIMER_STATE, ...JSON.parse(data) } : DEFAULT_TIMER_STATE;
    } catch {
      return DEFAULT_TIMER_STATE;
    }
  },

  saveActiveTimer: (timer: ActiveTimerState) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(timer));
  },

  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportBackup: (): string => {
    const data = {
      dateGoals: storage.getDateGoals(),
      records: storage.getRecords(),
      settings: storage.getSettings(),
      activeTimer: storage.getActiveTimer(),
      exportDate: new Date().toISOString(),
      version: '2.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.dateGoals)) {
        storage.saveDateGoals(parsed.dateGoals);
      }
      if (Array.isArray(parsed.records)) {
        storage.saveRecords(parsed.records);
      }
      if (parsed.settings) {
        storage.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }
      return true;
    } catch (e) {
      console.error('Backup import error:', e);
      return false;
    }
  },
};
