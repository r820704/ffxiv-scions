import type { EurekaChain } from '../types/eureka-gear';

export const EUREKA_CHAINS: EurekaChain[] = [
  { chainId: 'pld-galatyn',            job: 'PLD', isShield: false, displayName: '騎士 · 嘉拉汀' },
  { chainId: 'pld-galatyn-shield',     job: 'PLD', isShield: true,  displayName: '騎士 · 艾瓦拉克盾' },
  { chainId: 'war-farsha',             job: 'WAR', isShield: false, displayName: '戰士 · 伐煞斧' },
  { chainId: 'drg-ryunohige',          job: 'DRG', isShield: false, displayName: '龍騎士 · 龍鬚' },
  { chainId: 'mnk-sudarshana-chakra',  job: 'MNK', isShield: false, displayName: '武僧 · 善見神輪' },
  { chainId: 'nin-nagi',               job: 'NIN', isShield: false, displayName: '忍者 · 息風' },
  { chainId: 'brd-failnaught',         job: 'BRD', isShield: false, displayName: '吟遊詩人 · 必中琴弓' },
  { chainId: 'blm-vanargand',          job: 'BLM', isShield: false, displayName: '黑魔法師 · 破壞之杖' },
  { chainId: 'smn-lemegeton',          job: 'SMN', isShield: false, displayName: '召喚師 · 雷蒙蓋頓' },
  { chainId: 'whm-aymur',              job: 'WHM', isShield: false, displayName: '白魔法師 · 驅除之杖' },
];
