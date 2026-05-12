import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useEurekaWeaponsData } from '@/hooks/useEurekaWeaponsData';
import { useEurekaInventory } from '@/hooks/useEurekaInventory';
import type { ChainRef, UpgradeOutcome } from '@/hooks/useEurekaInventory';
import { OverviewTab } from '@/components/eureka-gear/OverviewTab';
import { DetailTab } from '@/components/eureka-gear/DetailTab';
import { FarmingTab } from '@/components/eureka-gear/FarmingTab';
import InventorySidebar from '@/components/eureka-gear/InventorySidebar';
import { UpgradeDialog } from '@/components/eureka-gear/UpgradeDialog';
import { OnboardingBanner, toggleOnboarding } from '@/components/eureka-gear/OnboardingBanner';
import { EUREKA_STAGES, STAGE_TC_LABEL } from '@/types/eureka-gear';
import type { EurekaStage, SlotProgress } from '@/types/eureka-gear';
import { sharedJobNames } from '@/data/eureka-armor-sets';
import type { Role } from '@/types/eureka';
import PageHead from '@/components/PageHead';

type TabKey = 'overview' | 'detail' | 'farming';

const LAST_TAB_KEY = 'eureka-gear-last-tab';
const LAST_JOB_KEY = 'eureka-gear-last-job';

function isTabKey(value: unknown): value is TabKey {
  return value === 'overview' || value === 'detail' || value === 'farming';
}

function getInitialTab(searchParams: URLSearchParams): TabKey {
  const fromUrl = searchParams.get('view');
  if (isTabKey(fromUrl)) return fromUrl;
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(LAST_TAB_KEY);
    if (isTabKey(stored)) return stored;
  }
  return 'overview';
}

function getInitialJob(searchParams: URLSearchParams): string {
  const fromUrl = searchParams.get('job');
  if (fromUrl) return fromUrl;
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(LAST_JOB_KEY);
    if (stored) return stored;
  }
  return 'PLD';
}

const VALID_ROLES: ReadonlyArray<Role> = ['all', 'tank', 'melee', 'ranged', 'healer', 'caster'];

function parseRole(raw: string | null): Role {
  if (raw && (VALID_ROLES as ReadonlyArray<string>).includes(raw)) {
    return raw as Role;
  }
  return 'all';
}

export default function EurekaGearPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = getInitialTab(searchParams);
  const selectedJob = getInitialJob(searchParams);
  const overviewRole = parseRole(searchParams.get('role'));

  const { weapons: weaponsList, materials: materialsList, loading, error } = useEurekaWeaponsData();
  const {
    inventory,
    setMaterial,
    setTarget,
    performUpgrade,
    clearMaterials,
    clearAllProgress,
    clearChain,
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

  const setTab = (tab: TabKey) => {
    const p = new URLSearchParams(searchParams);
    p.set('view', tab);
    setSearchParams(p);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LAST_TAB_KEY, tab);
    }
  };

  const selectJob = (job: string) => {
    const p = new URLSearchParams(searchParams);
    p.set('view', 'detail');
    p.set('job', job);
    setSearchParams(p);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LAST_JOB_KEY, job);
    }
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
    const toLabel = STAGE_TC_LABEL[outcome.to];
    const msg = outcome.hadEnough
      ? `已升到 ${toLabel}${mats ? ` · 扣除 ${mats}` : ''}`
      : `已升到 ${toLabel}（素材未足額紀錄、僅推進階段）`;
    toast.success(msg);
  };

  const executeUpgrade = (ref: ChainRef) => {
    const outcome = performUpgrade(ref);
    if (outcome) showUpgradeToast(outcome);
  };

  const handleRequestUpgrade = (ref: ChainRef) => {
    let slot: SlotProgress | undefined;
    if (ref.kind === 'weapon') {
      slot = inventory.weapons[ref.chainId];
    } else if (ref.kind === 'armor-anemos') {
      slot = inventory.armor.anemos[ref.job]?.[ref.slot];
    } else {
      slot = inventory.armor.elemental[ref.set]?.[ref.slot];
    }
    if (!slot?.targetStage) return;
    // currentStage undefined（尚未取得舊化）以 antiquated 為起點計算方向
    const currentIdx = EUREKA_STAGES.indexOf(slot.currentStage ?? 'antiquated');
    const targetIdx = EUREKA_STAGES.indexOf(slot.targetStage);
    const direction: 'up' | 'down' = targetIdx < currentIdx ? 'down' : 'up';
    // Only elemental armor is role-shared; anemos is per-job so no shared warning
    const sharedJobs = ref.kind === 'armor-elemental' ? sharedJobNames(ref.set) : [];
    if (sharedJobs.length > 1) {
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
      className={`px-3 py-2 text-sm ${view === key ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <PageHead
        title="禁地兵裝"
        description="優雷卡武器與防具升級進度追蹤"
        numeral="Tool · Ⅲ"
        actions={
          <button
            type="button"
            aria-label="切換說明"
            onClick={toggleOnboarding}
            className="w-8 h-8 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary transition-colors text-sm"
          >
            ?
          </button>
        }
      />
      {error && <div className="text-red-400 text-sm mb-2">載入失敗：{error}</div>}

      <OnboardingBanner />

      <nav
        role="tablist"
        className="sticky top-0 z-30 -mx-4 px-4 bg-background flex border-b-2 border-primary mb-4"
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
              onResetAllProgress={clearAllProgress}
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
      

              onClearChain={clearChain}
            />
          )}
          {view === 'farming' && (
            <FarmingTab
              inventory={inventory}
              weapons={weaponsList}
              materialsMap={materialsMap}
            />
          )}
        </main>
        <aside>
          <InventorySidebar
            materials={materialsList}
            inventory={inventory.materials}
            onMaterialChange={setMaterial}
            onClear={clearMaterials}
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
    </div>
  );
}
