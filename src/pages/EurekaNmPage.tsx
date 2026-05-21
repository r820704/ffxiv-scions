import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import { SubTabStrip } from '@/components/eureka-nm/SubTabStrip';
import { NmTable } from '@/components/eureka-nm/NmTable';
import { ConditionSummaryBar } from '@/components/eureka-nm/ConditionSummaryBar';
import NmDetailModal from '@/components/eureka-weather/NmDetailModal';
import { useNmTrackerRecords } from '@/hooks/useNmTrackerRecords';
import { useNmTrackerPinned } from '@/hooks/useNmTrackerPinned';
import { useNmTrackerNow } from '@/hooks/useNmTrackerNow';
import { useNmTrackerNotifications } from '@/hooks/useNmTrackerNotifications';
import { NotificationButton } from '@/components/eureka-nm/NotificationButton';
import { eurekaNms } from '@/data/eureka-nm-data';
import {
  type NmTabKey,
  isNmTabKey,
  NM_TRACKER_LAST_TAB_KEY,
  parseTabFromUrl,
  tabToUrl,
} from '@/types/nm-tracker';
import type { EurekaZone } from '@/data/weather-data';

function getInitialTab(searchParams: URLSearchParams): NmTabKey {
  const fromUrl = parseTabFromUrl(searchParams.get('tab'));
  if (fromUrl) return fromUrl;
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(NM_TRACKER_LAST_TAB_KEY);
    if (isNmTabKey(stored)) return stored;
  }
  return 'Eureka Anemos';
}

export default function EurekaNmPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTabState] = useState<NmTabKey>(() => getInitialTab(searchParams));
  const [detailNmId, setDetailNmId] = useState<string | null>(null);
  const records = useNmTrackerRecords();
  const pinned = useNmTrackerPinned();
  const now = useNmTrackerNow();
  const notifications = useNmTrackerNotifications({
    pinned: pinned.pinned,
    records: records.records,
  });

  const nmsForTab = useMemo(() => {
    if (tab === 'custom') return eurekaNms.filter(n => pinned.pinned.includes(n.id));
    return eurekaNms.filter(n => n.zone === tab);
  }, [tab, pinned.pinned]);

  function setTab(next: NmTabKey) {
    setTabState(next);
    const p = new URLSearchParams(searchParams);
    p.set('tab', tabToUrl(next));
    setSearchParams(p);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(NM_TRACKER_LAST_TAB_KEY, next);
    }
  }

  return (
    <>
      <PageHead
        title="惡名精英"
        description="記錄惡名精英的時間軸以及冷卻時間"
        actions={
          <NotificationButton
            pinned={pinned.pinned}
            enabled={notifications.enabled}
            permission={notifications.permission}
            supported={notifications.supported}
            onSetEnabled={notifications.setEnabled}
          />
        }
      />
      <SubTabStrip activeTab={tab} onTabChange={setTab} onClearAll={records.clearAll} />
      {tab !== 'custom' && <ConditionSummaryBar zone={tab as EurekaZone} now={now} />}
      <NmTable
        nms={nmsForTab}
        records={records.records}
        pinned={pinned.pinned}
        now={now}
        onTogglePin={pinned.toggle}
        onPop={records.setPop}
        onClear={records.clear}
        onSetCustom={records.setCustom}
        onOpenDetail={setDetailNmId}
      />
      <NmDetailModal nmId={detailNmId} onClose={() => setDetailNmId(null)} />
    </>
  );
}
