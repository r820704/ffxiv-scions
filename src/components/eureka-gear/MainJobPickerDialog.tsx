import { useEffect, useState } from 'react';
import {
  ARMOR_SET_FOR_JOB,
  JOB_TC_NAME,
  JOBS_WITH_WEAPONS,
  type JobId,
} from '../../data/eureka-armor-sets';

const ROLE_GROUPS: Array<{ label: string; setIds: string[] }> = [
  { label: '坦克', setIds: ['fending'] },
  { label: '近戰', setIds: ['maiming', 'striking', 'scouting'] },
  { label: '遠程', setIds: ['aiming'] },
  { label: '治療', setIds: ['healing'] },
  { label: '法職', setIds: ['casting'] },
];

export type MainJobPickerDialogProps = {
  isOpen: boolean;
  initial: JobId[];
  onConfirm: (jobs: JobId[]) => void;
  onCancel: () => void;
};

export function MainJobPickerDialog({ isOpen, initial, onConfirm, onCancel }: MainJobPickerDialogProps) {
  const [selected, setSelected] = useState<Set<JobId>>(() => new Set(initial));

  // Reset selection when dialog reopens with a different initial set.
  useEffect(() => {
    if (isOpen) setSelected(new Set(initial));
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const toggle = (job: JobId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(job)) next.delete(job);
      else next.add(job);
      return next;
    });
  };

  const handleSave = () => {
    onConfirm(Array.from(selected));
  };

  const handleClear = () => {
    setSelected(new Set());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="設定我的職業"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-5 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-yellow-400 mb-2">⭐ 設定我的職業</h2>
        <p className="text-xs text-gray-400 mb-4">
          選一個或多個自己常玩的職業，總覽會多一個「我的職業」chip 可以一鍵篩選。
        </p>

        <div className="space-y-3">
          {ROLE_GROUPS.map(({ label, setIds }) => {
            const jobs = JOBS_WITH_WEAPONS.filter((job) => setIds.includes(ARMOR_SET_FOR_JOB[job]));
            if (jobs.length === 0) return null;
            return (
              <div key={label}>
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {jobs.map((job) => {
                    const active = selected.has(job);
                    const tc = JOB_TC_NAME[job] ?? job;
                    return (
                      <button
                        key={job}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggle(job)}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          active
                            ? 'bg-yellow-500 text-black border-yellow-300'
                            : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        {tc}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 mt-5">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded border border-gray-600 text-gray-400 text-sm hover:text-gray-200"
          >
            全部清空
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded border border-gray-600 text-gray-400 text-sm"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 rounded font-bold text-sm bg-yellow-500 text-black"
            >
              儲存（{selected.size}）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
