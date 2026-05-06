import type { EurekaChain } from '../types/eureka-gear';

export const EUREKA_CHAINS: EurekaChain[] = [
  { chainId: 'pld-galatyn',            job: 'PLD', isShield: false, displayName: '騎士 · 嘉拉汀' },
  { chainId: 'pld-galatyn-shield',     job: 'PLD', isShield: true,  displayName: '騎士 · 艾瓦拉克血十字盾', mirrorsChainId: 'pld-galatyn' },
  { chainId: 'war-farsha',             job: 'WAR', isShield: false, displayName: '戰士 · 伐煞斧' },
  { chainId: 'drg-ryunohige',          job: 'DRG', isShield: false, displayName: '龍騎士 · 龍鬚' },
  { chainId: 'mnk-sudarshana-chakra',  job: 'MNK', isShield: false, displayName: '武僧 · 善見神輪' },
  { chainId: 'nin-nagi',               job: 'NIN', isShield: false, displayName: '忍者 · 息風' },
  { chainId: 'brd-failnaught',         job: 'BRD', isShield: false, displayName: '吟遊詩人 · 必中琴弓' },
  { chainId: 'blm-vanargand',          job: 'BLM', isShield: false, displayName: '黑魔道士 · 破壞之杖' },
  { chainId: 'smn-lemegeton',          job: 'SMN', isShield: false, displayName: '召喚士 · 雷蒙蓋頓' },
  { chainId: 'whm-aymur',              job: 'WHM', isShield: false, displayName: '白魔道士 · 驅除之杖' },
  { chainId: 'drk-caladbolg',          job: 'DRK', isShield: false, displayName: '暗黑騎士 · 裂斬劍卡拉德博爾格' },
  { chainId: 'sam-kiku-ichimonji',     job: 'SAM', isShield: false, displayName: '武士 · 菊一文字' },
  { chainId: 'mch-outsider',           job: 'MCH', isShield: false, displayName: '機工士 · 外來者' },
  { chainId: 'sch-organum',            job: 'SCH', isShield: false, displayName: '學者 · 工具論' },
  { chainId: 'ast-pleiades',           job: 'AST', isShield: false, displayName: '占星術師 · 昴星團天儀' },
  { chainId: 'rdm-murgleis',           job: 'RDM', isShield: false, displayName: '赤魔道士 · 死印劍' },
];
