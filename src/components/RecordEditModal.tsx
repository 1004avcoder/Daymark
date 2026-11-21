import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RecordEditModal: React.FC = () => {
  const { editingRecord, setEditingRecord, updateRecord, deleteRecord } = useApp();

  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setTitle(editingRecord.title || '');
      const h = Math.floor(editingRecord.durationSeconds / 3600);
      const m = Math.floor((editingRecord.durationSeconds % 3600) / 60);
      const s = editingRecord.durationSeconds % 60;
      setHours(h.toString());
      setMinutes(m.toString());
      setSeconds(s.toString());
      setNotes(editingRecord.notes || '');
    }
  }, [editingRecord]);

  if (!editingRecord) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSec =
      (parseInt(hours || '0', 10) * 3600) +
      (parseInt(minutes || '0', 10) * 60) +
      parseInt(seconds || '0', 10);

    if (totalSec <= 0) {
      alert('측정 시간은 0보다 커야 합니다.');
      return;
    }

    updateRecord(editingRecord.id, {
      title: title.trim() || '목표 측정',
      durationSeconds: totalSec,
      notes: notes.trim() || undefined,
    });

    setEditingRecord(null);
  };

  const handleDelete = () => {
    if (window.confirm('이 기록을 정말 삭제하시겠습니까?')) {
      deleteRecord(editingRecord.id);
      setEditingRecord(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevated animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            기록 세부 수정
          </h3>
          <button
            onClick={() => setEditingRecord(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              목표 / 활동 내용
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 알고리즘 3문제 풀기"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              측정 시간 (시 : 분 : 초)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-16 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono font-semibold text-xs text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-500">시</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-16 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono font-semibold text-xs text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-500">분</span>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-16 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono font-semibold text-xs text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-500">초</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              메모
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="기록에 대한 메모"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
              title="기록 삭제"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                취소
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800"
              >
                수정 완료
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
