import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import { SubTabStrip } from '@/components/eureka-nm/SubTabStrip';
import { useNmTrackerRecords } from '@/hooks/useNmTrackerRecords';
import {
  type NmTabKey,
  isNmTabKey,
  NM_TRACKER_LAST_TAB_KEY,
  parseTabFromUrl,
  tabToUrl,
} from '@/types/nm-tracker';

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
  const records = useNmTrackerRecords();

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
      />
      <SubTabStrip activeTab={tab} onTabChange={setTab} onClearAll={records.clearAll} />
      {/* Tasks 10+ will add ConditionSummaryBar + NmTable here */}
    </>
  );
}
