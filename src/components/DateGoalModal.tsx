import React, { useState, useEffect } from 'react';
import { X, Calendar, Trash2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityIcon, AVAILABLE_ICONS, PRESET_COLORS } from './ActivityIcon';
import { formatDateKeyKorean, isPastDate } from '../utils/format';

export const DateGoalModal: React.FC = () => {
  const {
    isGoalModalOpen,
    setIsGoalModalOpen,
    editingGoal,
    setEditingGoal,
    selectedDateKey,
    addDateGoal,
    updateDateGoal,
    deleteDateGoal,
  } = useApp();

  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('BookOpen');


  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setColor(editingGoal.color);
      setIcon(editingGoal.icon);
      const h = Math.floor(editingGoal.targetSeconds / 3600);
      const m = Math.floor((editingGoal.targetSeconds % 3600) / 60);
      setHours(h.toString());
      setMinutes(m.toString());
    } else {
      setTitle('');
      setHours('1');
      setMinutes('0');
      setColor('#3b82f6');
      setIcon('BookOpen');
    }
  }, [editingGoal, isGoalModalOpen]);

  if (!isGoalModalOpen) return null;

  const targetDateKey = editingGoal ? editingGoal.dateKey : selectedDateKey;
  const isPast = isPastDate(targetDateKey);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPast) {
      alert('이미 지난 날짜에는 목표를 설정할 수 없습니다.');
      return;
    }
    if (!title.trim()) {
      alert('목표 내용을 입력해주세요. (예: 알고리즘 3문제 풀기)');
      return;
    }

    const totalSec = (parseInt(hours || '0', 10) * 3600) + (parseInt(minutes || '0', 10) * 60);
    if (totalSec <= 0) {
      alert('목표 시간은 최소 1분 이상 설정해주세요.');
      return;
    }

    if (editingGoal) {
      updateDateGoal(editingGoal.id, {
        title: title.trim(),
        color,
        icon,
        targetSeconds: totalSec,
      });
    } else {
      addDateGoal(targetDateKey, {
        title: title.trim(),
        color,
        icon,
        targetSeconds: totalSec,
      });
    }

    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleDelete = () => {
    if (!editingGoal) return;
    if (isPast) {
      alert('과거 날짜의 목표는 삭제할 수 없습니다.');
      return;
    }
    if (window.confirm(`'${editingGoal.title}' 목표를 오늘 시간표에서 삭제하시겠습니까?`)) {
      deleteDateGoal(editingGoal.id);
      setIsGoalModalOpen(false);
      setEditingGoal(null);
    }
  };

  const handleQuickDuration = (h: number, m: number) => {
    setHours(h.toString());
    setMinutes(m.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevated animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingGoal ? '목표 수정' : '새 목표 추가'}
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar size={11} />
              {formatDateKeyKorean(targetDateKey)} 시간표
            </p>
          </div>
          <button
            onClick={() => {
              setIsGoalModalOpen(false);
              setEditingGoal(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {isPast ? (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 text-center">
            이미 지난 날짜에는 목표를 추가하거나 수정할 수 없습니다.
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Task Title (Study Planner Style) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                목표 내용 (직접 입력)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 알고리즘 3문제 풀기, 독서 30쪽 하기"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />

            </div>

            {/* Target Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                목표 시간
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-16 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono font-semibold text-xs text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-500">시간</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-16 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono font-semibold text-xs text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-500">분</span>
              </div>

              {/* Quick time buttons */}
              <div className="flex gap-1.5">
                {[
                  { label: '30분', h: 0, m: 30 },
                  { label: '1시간', h: 1, m: 0 },
                  { label: '1.5시간', h: 1, m: 30 },
                  { label: '2시간', h: 2, m: 0 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleQuickDuration(p.h, p.m)}
                    className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                라벨 색상
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check size={12} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                아이콘
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {AVAILABLE_ICONS.slice(0, 10).map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-xl flex items-center justify-center border transition-all ${
                      icon === ic
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ActivityIcon name={ic} size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              {editingGoal ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  title="목표 삭제"
                >
                  <Trash2 size={16} />
                </button>
              ) : <span />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGoalModalOpen(false);
                    setEditingGoal(null);
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800"
                >
                  {editingGoal ? '수정 완료' : '목표 추가'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
