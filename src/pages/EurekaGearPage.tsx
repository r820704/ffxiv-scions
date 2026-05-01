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
import { OnboardingBanner, toggleOnboarding } from '@/components/eureka-gear/OnboardingBanner';
import { EUREKA_STAGES } from '@/types/eureka-gear';
import type { EurekaStage } from '@/types/eureka-gear';
import { sharedJobNames } from '@/data/eureka-armor-sets';
import type { Role } from '@/types/eureka';

type TabKey = 'overview' | 'detail' | 'farming';

const VALID_ROLES: ReadonlyArray<Role> = ['all', 'tank', 'melee', 'ranged', 'healer', 'caster'];

function parseRole(raw: string | null): Role {
  if (raw && (VALID_ROLES as ReadonlyArray<string>).includes(raw)) {
    return raw as Role;
  }
  return 'all';
}

export default function EurekaGearPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = ((searchParams.get('view') as TabKey) ?? 'overview');
  const selectedJob = searchParams.get('job') ?? 'PLD';
  const overviewRole = parseRole(searchParams.get('role'));

  const { weapons: weaponsList, materials: materialsList, loading, error } = useEurekaWeaponsData();
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

  const setOverviewRole = (role: Role) => {
    const p = new URLSearchParams(searchParams);
    if (role === 'all') {
      p.delete('role');
    } else {
      p.set('role', role);
    }
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
    let slot: { currentStage: typeof EUREKA_STAGES[number]; targetStage?: typeof EUREKA_STAGES[number] } | undefined;
    if (ref.kind === 'weapon') {
      slot = inventory.weapons[ref.chainId];
    } else if (ref.kind === 'armor-anemos') {
      slot = inventory.armor.anemos[ref.job]?.[ref.slot];
    } else {
      slot = inventory.armor.elemental[ref.set]?.[ref.slot];
    }
    if (!slot?.targetStage) return;
    const currentIdx = EUREKA_STAGES.indexOf(slot.currentStage);
    const targetIdx = EUREKA_STAGES.indexOf(slot.targetStage);
    const direction: 'up' | 'down' = targetIdx < currentIdx ? 'down' : 'up';
    // Only elemental armor is role-shared; anemos is per-job so no shared warning
    const sharedJobs = ref.kind === 'armor-elemental' ? sharedJobNames(ref.set) : [];
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
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold">禁地兵裝</h1>
        <button
          type="button"
          aria-label="切換說明"
          onClick={toggleOnboarding}
          className="w-8 h-8 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary transition-colors text-sm"
        >
          ?
        </button>
      </div>
      {error && <div className="text-red-400 text-sm mb-2">載入失敗：{error}</div>}

      <OnboardingBanner />

      <nav
        role="tablist"
        className="sticky top-0 z-30 -mx-4 px-4 bg-background flex border-b-2 border-blue-500 mb-4"
      >
        {tabBtn('overview', '總覽')}
        {tabBtn('detail', '職業詳情')}
        {tabBtn('farming', '素材需求')}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
        <main>
          {view === 'overview' && (
            <OverviewTab
              inventory={inventory}
              weapons={weaponsList}
              onSelectJob={selectJob}
              role={overviewRole}
              onRoleChange={setOverviewRole}
            />
          )}
          {view === 'detail' && (
            <DetailTab
              inventory={inventory}
              selectedJob={selectedJob}
              weapons={weaponsList}
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
