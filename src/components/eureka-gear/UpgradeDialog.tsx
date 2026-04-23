import type { EurekaStage } from '../../types/eureka-gear';

export type UpgradeDialogProps = {
  isOpen: boolean;
  direction: 'up' | 'down';
  targetStage: EurekaStage;
  sharedJobs: string[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function UpgradeDialog({
  isOpen,
  direction,
  targetStage,
  sharedJobs,
  onConfirm,
  onCancel,
}: UpgradeDialogProps) {
  if (!isOpen) return null;

  const isShared = sharedJobs.length > 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-5 max-w-md">
        <h2 className="text-lg font-bold text-yellow-400 mb-3">
          📍 設為目前階段：{targetStage}
        </h2>
        <div className="text-sm text-gray-200 mb-4 leading-relaxed">
          {direction === 'down' ? (
            <p className="text-red-400">這會捨棄 {targetStage} 之後的進度。確定嗎？</p>
          ) : (
            <p>將此部位設為 {targetStage}。</p>
          )}
          {isShared && (
            <>
              <p className="mt-3">此更動會同步反映到：</p>
              <ul className="list-disc list-inside mt-1">
                {sharedJobs.map((job) => (
                  <li key={job} className="inline-block mr-2">
                    <span className="inline-block px-2 py-0.5 bg-blue-600 text-white rounded text-xs">
                      {job}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-1">（這些職業共用防具）</p>
            </>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded border border-gray-600 text-gray-400 text-sm"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 rounded font-bold text-sm ${
              direction === 'down' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'
            }`}
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
}
