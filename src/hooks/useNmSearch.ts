import { useMemo } from 'react';
import { eurekaNms, type EurekaNm } from '@/data/eureka-nm-data';

export function useNmSearch(query: string): EurekaNm[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return eurekaNms.filter((nm) => {
      if (nm.nameTw.toLowerCase().includes(q)) return true;
      if (nm.nameEn.toLowerCase().includes(q)) return true;
      if (nm.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [query]);
}
