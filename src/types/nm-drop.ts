export type DropKind =
  | 'accessory'
  | 'gear'
  | 'minion'
  | 'furniture'
  | 'card'
  | 'weapon-material'
  | 'logogram-manual'
  | 'crystal'
  | 'other';

export interface NmDropItem {
  nameTw: string; // TC name from thewakingsands/ffxiv-datamining-tc; fallback EN when no TC exists
  nameEn: string;
  kind: DropKind;
  notable: boolean; // only notable=true NMs get 📦 in the tracker table
}
