import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEurekaWeaponsData } from '@/hooks/useEurekaWeaponsData';
import { useEurekaInventory } from '@/hooks/useEurekaInventory';
import type { ChainRef, UpgradeOutcome } from '@/hooks/useEurekaInventory';
import { OverviewTab } from '@/components/eureka-gear/OverviewTab';
import { DetailTab } from '@/components/eureka-gear/DetailTab';
import { FarmingTab } from '@/components/eureka-gear/FarmingTab';
import InventorySidebar from '@/components/eureka-gear/InventorySidebar';
import { UpgradeDialog } from '@/components/eureka-gear/UpgradeDialog';
import { EUREKA_STAGES } from '@/types/eureka-gear';
import type { EurekaStage } from '@/types/eureka-gear';
import { JOBS_FOR_ARMOR_SET } from '@/data/eureka-armor-sets';

type TabKey = 'overview' | 'detail' | 'farming';

export default function EurekaGearPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = ((searchParams.get('view') as TabKey) ?? 'overview');
  const selectedJob = searchParams.get('job') ?? 'PLD';

  const { materials: materialsList, loading, error } = useEurekaWeaponsData();
  const {
    inventory,
    setMaterial,
    setTarget,
    performUpgrade,
    clearAll,
  } = useEurekaInventory();

  const materialsMap = useMemo(() => {
    const m: Record<number, { nameTC: string; icon: number }> = {};
    for (const mat of materialsList) {
      m[mat.id] = { nameTC: mat.tcName, icon: mat.iconId };
    }
    return m;
  }, [materialsList]);

  const [pendingDialog, setPendingDialog] = useState<{
    ref: ChainRef;
    direction: 'up' | 'down';
    targetStage: EurekaStage;
    sharedJobs: string[];
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const setTab = (tab: TabKey) => {
    const p = new URLSearchParams(searchParams);
    p.set('view', tab);
    setSearchParams(p);
  };

  const selectJob = (job: string) => {
    const p = new URLSearchParams(searchParams);
    p.set('view', 'detail');
    p.set('job', job);
    setSearchParams(p);
  };

  const showUpgradeToast = (outcome: UpgradeOutcome) => {
    const mats = outcome.materials
      .map((m) => `${m.quantity} × ${materialsMap[m.materialId]?.nameTC ?? m.materialId}`)
      .join('、');
    const msg = outcome.hadEnough
      ? `已升到 ${outcome.to}${mats ? ` · 扣除 ${mats}` : ''}`
      : `已升到 ${outcome.to}（素材未足額紀錄、僅推進階段）`;
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const executeUpgrade = (ref: ChainRef) => {
    const outcome = performUpgrade(ref);
    if (outcome) showUpgradeToast(outcome);
  };

  const handleRequestUpgrade = (ref: ChainRef) => {
    const slot = ref.kind === 'weapon'
      ? inventory.weapons[ref.chainId]
      : inventory.armor[ref.set][ref.slot];
    if (!slot?.targetStage) return;
    const currentIdx = EUREKA_STAGES.indexOf(slot.currentStage);
    const targetIdx = EUREKA_STAGES.indexOf(slot.targetStage);
    const direction: 'up' | 'down' = targetIdx < currentIdx ? 'down' : 'up';
    const sharedJobs = ref.kind === 'armor' ? JOBS_FOR_ARMOR_SET[ref.set] : [];
    if (direction === 'down' || sharedJobs.length > 1) {
      setPendingDialog({ ref, direction, targetStage: slot.targetStage, sharedJobs });
    } else {
      executeUpgrade(ref);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-400">載入中...</div>;
  }

  const tabBtn = (key: TabKey, label: string) => (
    <button
      key={key}
      role="tab"
      aria-selected={view === key}
      onClick={() => setTab(key)}
      className={`px-3 py-2 text-sm ${view === key ? 'bg-blue-500 text-white font-bold' : 'text-gray-400'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-lg font-semibold mb-2">禁地兵裝</h1>
      {error && <div className="text-red-400 text-sm mb-2">載入失敗：{error}</div>}

      <nav role="tablist" className="flex border-b-2 border-blue-500 mb-4">
        {tabBtn('overview', '總覽')}
        {tabBtn('detail', '職業詳情')}
        {tabBtn('farming', '農地視圖')}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
        <main>
          {view === 'overview' && (
            <OverviewTab inventory={inventory} onSelectJob={selectJob} />
          )}
          {view === 'detail' && (
            <DetailTab
              inventory={inventory}
              selectedJob={selectedJob}
              materialsMap={materialsMap}
              onSelectJob={selectJob}
              onSetTarget={setTarget}
              onRequestUpgrade={handleRequestUpgrade}
            />
          )}
          {view === 'farming' && (
            <FarmingTab inventory={inventory} materialsMap={materialsMap} />
          )}
        </main>
        <aside>
          <InventorySidebar
            materials={materialsList}
            inventory={inventory.materials}
            onMaterialChange={setMaterial}
            onClear={clearAll}
          />
        </aside>
      </div>

      {pendingDialog && (
        <UpgradeDialog
          isOpen
          direction={pendingDialog.direction}
          targetStage={pendingDialog.targetStage}
          sharedJobs={pendingDialog.sharedJobs}
          onConfirm={() => {
            executeUpgrade(pendingDialog.ref);
            setPendingDialog(null);
          }}
          onCancel={() => setPendingDialog(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-600 rounded px-4 py-2 text-sm shadow z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
