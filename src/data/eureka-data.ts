import type { Logogram, Mneme, EurekaData } from '@/types/eureka';

export const eurekaData: EurekaData = {
  logograms: [
    { id: 'conceptual', itemId: 24007, nameTw: '未鑑定的新銳文理碎晶', mnemeIds: ['wisdom-aetherweaver', 'wisdom-martialist', 'wisdom-platebearer', 'incense-l', 'cure-l', 'backstep-l', 'paralyze-l'] },
    { id: 'fundamental', itemId: 24008, nameTw: '未鑑定的熟練文理碎晶', mnemeIds: ['esuna-l', 'raise-l', 'feint-l', 'tranquilizer-l', 'protect-l'] },
    { id: 'curative', itemId: 24009, nameTw: '未鑑定的治癒文理碎晶', mnemeIds: ['wisdom-ordained', 'cure-l-ii'] },
    { id: 'offensive', itemId: 24010, nameTw: '未鑑定的攻勢文理碎晶', mnemeIds: ['wisdom-skirmisher', 'bloodbath-l'] },
    { id: 'protective', itemId: 24011, nameTw: '未鑑定的守勢文理碎晶', mnemeIds: ['wisdom-guardian', 'spirit-remembered'] },
    { id: 'tactical', itemId: 24012, nameTw: '未鑑定的斥候文理碎晶', mnemeIds: ['featherfoot-l', 'stealth-l'] },
    { id: 'mitigative', itemId: 24013, nameTw: '未鑑定的支援文理碎晶', mnemeIds: ['shell-l', 'stoneskin-l'] },
    { id: 'inimical', itemId: 24014, nameTw: '未鑑定的妨礙文理碎晶', mnemeIds: ['spirit-dart-l', 'dispel-l'] },
    { id: 'obscure', itemId: 24809, nameTw: '未鑑定的封印文理碎晶', mnemeIds: ['magic-burst-l', 'eagle-eye-shot-l', 'double-edge-l', 'wisdom-breathtaker'] },
  ],

  mnemes: [
    { id: 'wisdom-aetherweaver', nameTw: '術士的記憶', sourceLogogramId: 'conceptual' },
    { id: 'wisdom-martialist', nameTw: '鬥士的記憶', sourceLogogramId: 'conceptual' },
    { id: 'wisdom-platebearer', nameTw: '重騎兵的記憶', sourceLogogramId: 'conceptual' },
    { id: 'incense-l', nameTw: '文理激怒', sourceLogogramId: 'conceptual' },
    { id: 'cure-l', nameTw: '文理療傷', sourceLogogramId: 'conceptual' },
    { id: 'backstep-l', nameTw: '文理後跳', sourceLogogramId: 'conceptual' },
    { id: 'paralyze-l', nameTw: '文理麻痺', sourceLogogramId: 'conceptual' },
    { id: 'esuna-l', nameTw: '文理復原', sourceLogogramId: 'fundamental' },
    { id: 'raise-l', nameTw: '文理復活', sourceLogogramId: 'fundamental' },
    { id: 'feint-l', nameTw: '文理虛槍', sourceLogogramId: 'fundamental' },
    { id: 'tranquilizer-l', nameTw: '文理鎮定', sourceLogogramId: 'fundamental' },
    { id: 'protect-l', nameTw: '文理物防護', sourceLogogramId: 'fundamental' },
    { id: 'wisdom-ordained', nameTw: '祭司的記憶', sourceLogogramId: 'curative' },
    { id: 'cure-l-ii', nameTw: '文理中療傷', sourceLogogramId: 'curative' },
    { id: 'wisdom-skirmisher', nameTw: '武人的記憶', sourceLogogramId: 'offensive' },
    { id: 'bloodbath-l', nameTw: '文理浴血', sourceLogogramId: 'offensive' },
    { id: 'wisdom-guardian', nameTw: '守護者的記憶', sourceLogogramId: 'protective' },
    { id: 'spirit-remembered', nameTw: '英傑的加護', sourceLogogramId: 'protective' },
    { id: 'featherfoot-l', nameTw: '文理飄羽步', sourceLogogramId: 'tactical' },
    { id: 'stealth-l', nameTw: '文理潛行', sourceLogogramId: 'tactical' },
    { id: 'shell-l', nameTw: '文理魔防殼', sourceLogogramId: 'mitigative' },
    { id: 'stoneskin-l', nameTw: '文理石膚', sourceLogogramId: 'mitigative' },
    { id: 'spirit-dart-l', nameTw: '文理精神鏢', sourceLogogramId: 'inimical' },
    { id: 'dispel-l', nameTw: '文理驅魔', sourceLogogramId: 'inimical' },
    { id: 'magic-burst-l', nameTw: '文理魔法爆發', sourceLogogramId: 'obscure' },
    { id: 'eagle-eye-shot-l', nameTw: '文理銳眼追擊', sourceLogogramId: 'obscure' },
    { id: 'double-edge-l', nameTw: '文理雙刃劍', sourceLogogramId: 'obscure' },
    { id: 'wisdom-breathtaker', nameTw: '盜賊的記憶', sourceLogogramId: 'obscure' },
  ],

  logosActions: [
    // === 智慧 (WISDOM) ===
    {
      id: 'wisdom-aetherweaver', nameTw: '術士的記憶', descriptionTw: '魔法攻擊力提高60%',
      category: 'wisdom', roles: ['healer'], iconId: 64601,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [{ ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }] }],
    },
    {
      id: 'wisdom-martialist', nameTw: '鬥士的記憶', descriptionTw: '攻擊力提高40%',
      category: 'wisdom', roles: ['tank'], iconId: 64602,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [{ ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 1 }] }],
    },
    {
      id: 'wisdom-platebearer', nameTw: '重騎兵的記憶', descriptionTw: '受到的傷害減少80%，最大HP提高50%',
      category: 'wisdom', roles: ['healer', 'caster', 'ranged', 'melee'], iconId: 64603,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [{ ingredients: [{ mnemeId: 'wisdom-platebearer', quantity: 1 }] }],
    },
    {
      id: 'wisdom-guardian', nameTw: '守護者的記憶', descriptionTw: '受到的傷害減少45%，最大HP提高10%',
      category: 'wisdom', roles: ['tank'], iconId: 64604,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-platebearer', quantity: 1 }, { mnemeId: 'protect-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-guardian', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-platebearer', quantity: 1 }, { mnemeId: 'stoneskin-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-platebearer', quantity: 1 }, { mnemeId: 'incense-l', quantity: 2 }] },
        { ingredients: [{ mnemeId: 'stoneskin-l', quantity: 3 }] },
      ],
    },
    {
      id: 'wisdom-ordained', nameTw: '祭司的記憶', descriptionTw: '最大MP提高50%，治療魔法的回復力提高25%',
      category: 'wisdom', roles: ['healer'], iconId: 64605,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'esuna-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-ordained', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'cure-l', quantity: 2 }] },
        { ingredients: [{ mnemeId: 'cure-l-ii', quantity: 3 }] },
      ],
    },
    {
      id: 'wisdom-skirmisher', nameTw: '武人的記憶', descriptionTw: '攻擊力提高20%',
      category: 'wisdom', roles: ['caster', 'ranged', 'melee'], iconId: 64606,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 1 }, { mnemeId: 'feint-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 3 }] },
      ],
    },
    {
      id: 'wisdom-watcher', nameTw: '斥候的記憶', descriptionTw: '迴避率提高25%，攻擊力降低5%',
      category: 'wisdom', roles: ['tank'], iconId: 64607,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [{ ingredients: [{ mnemeId: 'stealth-l', quantity: 2 }] }],
    },
    {
      id: 'wisdom-templar', nameTw: '聖騎士的記憶', descriptionTw: '治療魔法的回復力提高50%，最大HP提高30%，攻擊力降低5%',
      category: 'wisdom', roles: ['healer'], iconId: 64608,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'cure-l-ii', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'stoneskin-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-platebearer', quantity: 1 }, { mnemeId: 'cure-l', quantity: 1 }, { mnemeId: 'stoneskin-l', quantity: 1 }] },
      ],
    },
    {
      id: 'wisdom-irregular', nameTw: '狂戰士的記憶', descriptionTw: '攻擊力提高30%，魔法防禦力降低60%',
      category: 'wisdom', roles: ['caster', 'ranged', 'melee'], iconId: 64609,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 1 }, { mnemeId: 'incense-l', quantity: 1 }, { mnemeId: 'wisdom-skirmisher', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'wisdom-guardian', quantity: 1 }] },
      ],
    },
    {
      id: 'wisdom-breathtaker', nameTw: '盜賊的記憶', descriptionTw: '毒抗性提高，移動速度提高，迴避率提高10%',
      category: 'wisdom', roles: ['all'], iconId: 64610,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-breathtaker', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'featherfoot-l', quantity: 1 }, { mnemeId: 'stealth-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'stealth-l', quantity: 3 }] },
        { ingredients: [{ mnemeId: 'featherfoot-l', quantity: 3 }] },
      ],
    },
    {
      id: 'wisdom-elder', nameTw: '長老的記憶', descriptionTw: '魔法攻擊力提高35%，魔法防禦力降低22%，魔法MP消耗減少',
      category: 'wisdom', roles: ['caster'], iconId: 64652,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }, { mnemeId: 'magic-burst-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-guardian', quantity: 1 }, { mnemeId: 'stoneskin-l', quantity: 1 }, { mnemeId: 'magic-burst-l', quantity: 1 }] },
      ],
    },
    {
      id: 'wisdom-duelist', nameTw: '決鬥者的記憶', descriptionTw: '物理攻擊力提高40%，最大HP提高15%',
      category: 'wisdom', roles: ['melee'], iconId: 64653,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'backstep-l', quantity: 1 }, { mnemeId: 'bloodbath-l', quantity: 1 }, { mnemeId: 'double-edge-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 2 }, { mnemeId: 'double-edge-l', quantity: 1 }] },
      ],
    },
    {
      id: 'wisdom-fiendhunter', nameTw: '獵魔者的記憶', descriptionTw: '物理攻擊力提高25%，迴避率提高25%',
      category: 'wisdom', roles: ['ranged'], iconId: 64654,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'featherfoot-l', quantity: 1 }, { mnemeId: 'spirit-dart-l', quantity: 1 }, { mnemeId: 'eagle-eye-shot-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'feint-l', quantity: 1 }, { mnemeId: 'tranquilizer-l', quantity: 1 }, { mnemeId: 'eagle-eye-shot-l', quantity: 1 }] },
      ],
    },
    {
      id: 'wisdom-indomitable', nameTw: '不屈者的記憶', descriptionTw: '受到的傷害減少64%，受到超過50%HP的傷害時回復HP',
      category: 'wisdom', roles: ['tank'], iconId: 64655,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-platebearer', quantity: 1 }, { mnemeId: 'incense-l', quantity: 1 }, { mnemeId: 'double-edge-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'protect-l', quantity: 1 }, { mnemeId: 'spirit-remembered', quantity: 1 }, { mnemeId: 'double-edge-l', quantity: 1 }] },
      ],
    },
    // === 精神 (SPIRIT) ===
    {
      id: 'spirit-remembered', nameTw: '英傑的加護', descriptionTw: '最大HP提高10%，命中率提高30%，倒下時70%機率自動復活（180分鐘）',
      category: 'spirit', roles: ['all'], iconId: 64611,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 100, range: 0, effectRange: 0, duration: '180分',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'wisdom-martialist', quantity: 1 }, { mnemeId: 'wisdom-platebearer', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'spirit-remembered', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 1 }, { mnemeId: 'wisdom-guardian', quantity: 1 }] },
      ],
    },
    // === 攻擊 (OFFENSIVE) ===
    {
      id: 'spirit-dart-l', nameTw: '文理精神鏢', descriptionTw: '遠程攻擊（威力100），目標受到的傷害增加8%（60秒）',
      category: 'offensive', roles: ['caster', 'ranged', 'melee'], iconId: 64617,
      actionCategory: 'weaponskill', cast100ms: 0, recast100ms: 25, range: 25, effectRange: 0, duration: '60秒',
      recipes: [
        { ingredients: [{ mnemeId: 'spirit-dart-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'tranquilizer-l', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'paralyze-l', quantity: 1 }, { mnemeId: 'tranquilizer-l', quantity: 1 }] },
      ],
    },
    {
      id: 'catastrophe-l', nameTw: '文理天災', descriptionTw: '範圍攻擊（威力4000），對自身造成999999傷害',
      category: 'offensive', roles: ['ranged', 'melee', 'tank'], iconId: 64618,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 3000, range: 0, effectRange: 20, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'bloodbath-l', quantity: 2 }] },
        { ingredients: [{ mnemeId: 'wisdom-guardian', quantity: 1 }, { mnemeId: 'spirit-dart-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'spirit-dart-l', quantity: 3 }] },
      ],
    },
    {
      id: 'death-l', nameTw: '文理致死一擊', descriptionTw: '即死（目標HP越低成功率越高）',
      category: 'offensive', roles: ['all'], iconId: 64641,
      actionCategory: 'spell', cast100ms: 50, recast100ms: 3000, range: 30, effectRange: 0, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'raise-l', quantity: 1 }, { mnemeId: 'dispel-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'raise-l', quantity: 1 }, { mnemeId: 'tranquilizer-l', quantity: 2 }] },
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'paralyze-l', quantity: 1 }, { mnemeId: 'raise-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'dispel-l', quantity: 3 }] },
      ],
    },
    {
      id: 'focus-l', nameTw: '文理蓄力', descriptionTw: '增加蓄力層數（最大16層），每層武器技能威力提高30%',
      category: 'offensive', roles: ['all'], iconId: 64642,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 25, range: 0, effectRange: 0, duration: '30秒',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'bloodbath-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 1 }, { mnemeId: 'stoneskin-l', quantity: 2 }] },
        { ingredients: [{ mnemeId: 'bloodbath-l', quantity: 3 }] },
      ],
    },
    {
      id: 'double-edge-l', nameTw: '文理雙刃劍', descriptionTw: '物理攻擊力每層提高15%（最大16層），每層自傷1200（48秒）',
      category: 'offensive', roles: ['melee', 'tank'], iconId: 64649,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 900, range: 0, effectRange: 0, duration: '48秒',
      recipes: [
        { ingredients: [{ mnemeId: 'double-edge-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'bloodbath-l', quantity: 1 }, { mnemeId: 'wisdom-guardian', quantity: 1 }] },
      ],
    },
    {
      id: 'eagle-eye-shot-l', nameTw: '文理銳眼追擊', descriptionTw: '遠程攻擊（威力80），目標HP越低傷害越高（最高1000%）',
      category: 'offensive', roles: ['ranged'], iconId: 64650,
      actionCategory: 'weaponskill', cast100ms: 0, recast100ms: 25, range: 25, effectRange: 0, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'eagle-eye-shot-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'spirit-remembered', quantity: 1 }, { mnemeId: 'spirit-dart-l', quantity: 1 }] },
      ],
    },
    {
      id: 'magic-burst-l', nameTw: '文理魔法爆發', descriptionTw: '魔法傷害提高100%，MP消耗增加（20秒）',
      category: 'offensive', roles: ['caster', 'healer'], iconId: 64648,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 900, range: 0, effectRange: 0, duration: '20秒',
      recipes: [
        { ingredients: [{ mnemeId: 'magic-burst-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'spirit-remembered', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }, { mnemeId: 'stoneskin-l', quantity: 1 }] },
      ],
    },
    {
      id: 'smite-l', nameTw: '文理猛擊', descriptionTw: '攻擊（威力1000，HP低於50%時可使用），回復HP',
      category: 'offensive', roles: ['tank'], iconId: 64638,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 450, range: 3, effectRange: 0, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'tranquilizer-l', quantity: 1 }, { mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'spirit-dart-l', quantity: 1 }] },
      ],
    },
    {
      id: 'banish-l', nameTw: '文理放逐', descriptionTw: '無屬性攻擊（威力200），不死族受到的傷害增加25%（60秒）',
      category: 'offensive', roles: ['healer'], iconId: 64639,
      actionCategory: 'spell', cast100ms: 25, recast100ms: 25, range: 25, effectRange: 0, duration: '60秒',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'dispel-l', quantity: 2 }] },
      ],
    },
    {
      id: 'banish-l-iii', nameTw: '文理強放逐', descriptionTw: '範圍無屬性攻擊（威力150），不死族受到的傷害增加25%（60秒）',
      category: 'offensive', roles: ['healer'], iconId: 64640,
      actionCategory: 'spell', cast100ms: 30, recast100ms: 25, range: 25, effectRange: 12, duration: '60秒',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-ordained', quantity: 1 }, { mnemeId: 'dispel-l', quantity: 2 }] },
      ],
    },
    {
      id: 'haymaker-l', nameTw: '文理反攻', descriptionTw: '攻擊（威力300，迴避後可使用），目標減速20%（30秒）',
      category: 'offensive', roles: ['tank'], iconId: 64627,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 300, range: -1, effectRange: 0, duration: '30秒',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'featherfoot-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 1 }, { mnemeId: 'incense-l', quantity: 1 }, { mnemeId: 'featherfoot-l', quantity: 1 }] },
      ],
    },
    // === 防禦 (DEFENSIVE) ===
    {
      id: 'protect-l', nameTw: '文理物防護', descriptionTw: '物理傷害減免22%（30分鐘）',
      category: 'defensive', roles: ['all'], iconId: 64612,
      actionCategory: 'spell', cast100ms: 25, recast100ms: 25, range: 30, effectRange: 0, duration: '30分',
      recipes: [{ ingredients: [{ mnemeId: 'protect-l', quantity: 1 }] }],
    },
    {
      id: 'shell-l', nameTw: '文理魔防殼', descriptionTw: '魔法傷害減免22%（30分鐘）',
      category: 'defensive', roles: ['all'], iconId: 64613,
      actionCategory: 'spell', cast100ms: 25, recast100ms: 25, range: 30, effectRange: 0, duration: '30分',
      recipes: [
        { ingredients: [{ mnemeId: 'shell-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'protect-l', quantity: 1 }, { mnemeId: 'esuna-l', quantity: 1 }] },
      ],
    },
    {
      id: 'stoneskin-l', nameTw: '文理石膚', descriptionTw: '護盾吸收10%最大HP的傷害（30秒）',
      category: 'defensive', roles: ['all'], iconId: 64631,
      actionCategory: 'spell', cast100ms: 20, recast100ms: 25, range: 30, effectRange: 0, duration: '30秒',
      recipes: [
        { ingredients: [{ mnemeId: 'stoneskin-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'protect-l', quantity: 1 }, { mnemeId: 'shell-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'protect-l', quantity: 3 }] },
        { ingredients: [{ mnemeId: 'shell-l', quantity: 3 }] },
      ],
    },
    {
      id: 'solid-shield-l', nameTw: '文理物理盾', descriptionTw: '物理傷害減免99%（8秒）',
      category: 'defensive', roles: ['caster', 'ranged', 'melee', 'healer'], iconId: 64636,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 3000, range: 0, effectRange: 0, duration: '8秒',
      recipes: [
        { ingredients: [{ mnemeId: 'protect-l', quantity: 1 }, { mnemeId: 'wisdom-guardian', quantity: 1 }, { mnemeId: 'stoneskin-l', quantity: 1 }] },
      ],
    },
    {
      id: 'spell-shield-l', nameTw: '文理魔法盾', descriptionTw: '魔法傷害減免99%（8秒）',
      category: 'defensive', roles: ['caster', 'ranged', 'melee', 'healer'], iconId: 64637,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 3000, range: 0, effectRange: 0, duration: '8秒',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-guardian', quantity: 1 }, { mnemeId: 'shell-l', quantity: 1 }, { mnemeId: 'stoneskin-l', quantity: 1 }] },
      ],
    },
    {
      id: 'reflect-l', nameTw: '文理反射', descriptionTw: '反射魔法屏障（10秒）',
      category: 'defensive', roles: ['all'], iconId: 64646,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 25, range: 30, effectRange: 0, duration: '10秒',
      recipes: [
        { ingredients: [{ mnemeId: 'protect-l', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }, { mnemeId: 'shell-l', quantity: 1 }] },
      ],
    },
    {
      id: 'featherfoot-l', nameTw: '文理飄羽步', descriptionTw: '迴避率提高15%（45秒）',
      category: 'defensive', roles: ['all'], iconId: 64616,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 900, range: 0, effectRange: 0, duration: '45秒',
      recipes: [
        { ingredients: [{ mnemeId: 'featherfoot-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'feint-l', quantity: 2 }] },
      ],
    },
    {
      id: 'bloodbath-l', nameTw: '文理浴血', descriptionTw: '攻擊傷害轉化為HP回復（45秒）',
      category: 'defensive', roles: ['all'], iconId: 64625,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 600, range: 0, effectRange: 0, duration: '45秒',
      recipes: [
        { ingredients: [{ mnemeId: 'bloodbath-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'cure-l', quantity: 1 }, { mnemeId: 'wisdom-skirmisher', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 2 }, { mnemeId: 'cure-l', quantity: 1 }] },
      ],
    },
    // === 回復 (HEALING) ===
    {
      id: 'cure-l', nameTw: '文理療傷', descriptionTw: '回復HP（回復力9000）',
      category: 'healing', roles: ['caster', 'ranged', 'melee', 'tank'], iconId: 64629,
      actionCategory: 'spell', cast100ms: 20, recast100ms: 25, range: 30, effectRange: 0, duration: null,
      recipes: [{ ingredients: [{ mnemeId: 'cure-l', quantity: 1 }] }],
    },
    {
      id: 'cure-l-ii', nameTw: '文理中療傷', descriptionTw: '回復HP（回復力12000）',
      category: 'healing', roles: ['caster', 'ranged', 'melee'], iconId: 64630,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 50, range: 30, effectRange: 0, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'cure-l-ii', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'cure-l', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'cure-l', quantity: 3 }] },
        { ingredients: [{ mnemeId: 'raise-l', quantity: 3 }] },
      ],
    },
    {
      id: 'cure-l-iii', nameTw: '文理大療傷', descriptionTw: '範圍回復HP（回復力9000）',
      category: 'healing', roles: ['caster', 'ranged', 'melee', 'tank'], iconId: 64632,
      actionCategory: 'spell', cast100ms: 20, recast100ms: 25, range: 30, effectRange: 15, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'cure-l-ii', quantity: 2 }] },
        { ingredients: [{ mnemeId: 'bloodbath-l', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'cure-l', quantity: 2 }, { mnemeId: 'wisdom-ordained', quantity: 1 }] },
      ],
    },
    {
      id: 'regen-l', nameTw: '文理再生', descriptionTw: '持續回復HP（回復力2500，21秒）',
      category: 'healing', roles: ['caster', 'ranged', 'melee', 'tank'], iconId: 64633,
      actionCategory: 'spell', cast100ms: 0, recast100ms: 25, range: 30, effectRange: 0, duration: '21秒',
      recipes: [
        { ingredients: [{ mnemeId: 'tranquilizer-l', quantity: 1 }, { mnemeId: 'cure-l-ii', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'feint-l', quantity: 1 }, { mnemeId: 'cure-l-ii', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'cure-l', quantity: 2 }, { mnemeId: 'feint-l', quantity: 1 }] },
      ],
    },
    {
      id: 'esuna-l', nameTw: '文理復原', descriptionTw: '移除一個異常狀態',
      category: 'healing', roles: ['caster', 'ranged', 'melee', 'tank'], iconId: 64634,
      actionCategory: 'spell', cast100ms: 10, recast100ms: 25, range: 30, effectRange: 0, duration: null,
      recipes: [{ ingredients: [{ mnemeId: 'esuna-l', quantity: 1 }] }],
    },
    {
      id: 'raise-l', nameTw: '文理復活', descriptionTw: '復活目標',
      category: 'healing', roles: ['caster', 'ranged', 'melee', 'tank'], iconId: 64645,
      actionCategory: 'spell', cast100ms: 30, recast100ms: 25, range: 30, effectRange: 0, duration: null,
      recipes: [{ ingredients: [{ mnemeId: 'raise-l', quantity: 1 }] }],
    },
    {
      id: 'rejuvenate-l', nameTw: '文理充能', descriptionTw: '回復50%最大HP和MP',
      category: 'healing', roles: ['all'], iconId: 64626,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 300, range: 0, effectRange: 0, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'bloodbath-l', quantity: 1 }, { mnemeId: 'shell-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'spirit-remembered', quantity: 1 }, { mnemeId: 'spirit-dart-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'wisdom-martialist', quantity: 1 }, { mnemeId: 'cure-l', quantity: 1 }] },
      ],
    },
    {
      id: 'sacrifice-l', nameTw: '文理獻祭', descriptionTw: '回復目標100%HP（倒下狀態也可），自身獲得死宣告',
      category: 'healing', roles: ['healer'], iconId: 64656,
      actionCategory: 'spell', cast100ms: 30, recast100ms: 25, range: 30, effectRange: 0, duration: '10秒',
      recipes: [
        { ingredients: [{ mnemeId: 'esuna-l', quantity: 1 }, { mnemeId: 'raise-l', quantity: 1 }, { mnemeId: 'magic-burst-l', quantity: 1 }] },
      ],
    },
    {
      id: 'refresh-l', nameTw: '文理醒神', descriptionTw: '提高以太恢復速度（30秒）',
      category: 'healing', roles: ['healer'], iconId: 64647,
      actionCategory: 'spell', cast100ms: 30, recast100ms: 25, range: 0, effectRange: 20, duration: '30秒',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }, { mnemeId: 'cure-l-ii', quantity: 1 }] },
      ],
    },
    {
      id: 'bravery-l', nameTw: '文理勇氣', descriptionTw: '目標攻擊力提高10%（300秒）',
      category: 'healing', roles: ['caster', 'healer'], iconId: 64635,
      actionCategory: 'spell', cast100ms: 25, recast100ms: 25, range: 30, effectRange: 0, duration: '300秒',
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-skirmisher', quantity: 1 }, { mnemeId: 'wisdom-guardian', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }] },
      ],
    },
    // === 輔助 (UTILITY) ===
    {
      id: 'paralyze-l', nameTw: '文理麻痺', descriptionTw: '賦予麻痺狀態（60秒）',
      category: 'utility', roles: ['all'], iconId: 64614,
      actionCategory: 'spell', cast100ms: 25, recast100ms: 25, range: 30, effectRange: 0, duration: '60秒',
      recipes: [{ ingredients: [{ mnemeId: 'paralyze-l', quantity: 1 }] }],
    },
    {
      id: 'paralyze-l-iii', nameTw: '文理強麻痺', descriptionTw: '範圍賦予麻痺狀態（60秒）',
      category: 'utility', roles: ['all'], iconId: 64615,
      actionCategory: 'spell', cast100ms: 25, recast100ms: 25, range: 30, effectRange: 6, duration: '60秒',
      recipes: [
        { ingredients: [{ mnemeId: 'paralyze-l', quantity: 1 }, { mnemeId: 'spirit-dart-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'paralyze-l', quantity: 3 }] },
        { ingredients: [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }, { mnemeId: 'paralyze-l', quantity: 2 }] },
      ],
    },
    {
      id: 'tranquilizer-l', nameTw: '文理鎮定', descriptionTw: '暈眩目標（8秒）',
      category: 'utility', roles: ['all'], iconId: 64624,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 300, range: 25, effectRange: 0, duration: '8秒',
      recipes: [{ ingredients: [{ mnemeId: 'tranquilizer-l', quantity: 1 }] }],
    },
    {
      id: 'dispel-l', nameTw: '文理驅魔', descriptionTw: '移除敵人一個增益效果',
      category: 'utility', roles: ['caster', 'ranged', 'melee', 'healer'], iconId: 64619,
      actionCategory: 'spell', cast100ms: 25, recast100ms: 25, range: 30, effectRange: 0, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'dispel-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'esuna-l', quantity: 1 }, { mnemeId: 'wisdom-ordained', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'esuna-l', quantity: 3 }] },
        { ingredients: [{ mnemeId: 'tranquilizer-l', quantity: 3 }] },
      ],
    },
    {
      id: 'incense-l', nameTw: '文理激怒', descriptionTw: '獲得最高仇恨，仇恨產生量提高（15秒）',
      category: 'utility', roles: ['caster', 'ranged', 'melee', 'healer'], iconId: 64644,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 200, range: 25, effectRange: 0, duration: '15秒',
      recipes: [{ ingredients: [{ mnemeId: 'incense-l', quantity: 1 }] }],
    },
    {
      id: 'feint-l', nameTw: '文理虛槍', descriptionTw: '攻擊（威力100），降低目標迴避率（60秒）',
      category: 'utility', roles: ['healer', 'tank'], iconId: 64620,
      actionCategory: 'weaponskill', cast100ms: 0, recast100ms: 25, range: -1, effectRange: 0, duration: '60秒',
      recipes: [{ ingredients: [{ mnemeId: 'feint-l', quantity: 1 }] }],
    },
    {
      id: 'rapid-recast-l', nameTw: '文理高速冷卻', descriptionTw: '下一個能力技回復時間縮短50%（15秒）',
      category: 'utility', roles: ['caster', 'ranged', 'melee', 'tank'], iconId: 64628,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 900, range: 0, effectRange: 0, duration: '15秒',
      recipes: [
        { ingredients: [{ mnemeId: 'esuna-l', quantity: 1 }, { mnemeId: 'dispel-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'cure-l', quantity: 1 }, { mnemeId: 'esuna-l', quantity: 1 }, { mnemeId: 'feint-l', quantity: 1 }] },
      ],
    },
    {
      id: 'perception-l', nameTw: '文理探景', descriptionTw: '顯示陷阱（15碼）／偵測（36碼）',
      category: 'utility', roles: ['caster', 'ranged', 'melee'], iconId: 64651,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 35, range: 0, effectRange: 15, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'wisdom-breathtaker', quantity: 2 }] },
        { ingredients: [{ mnemeId: 'stealth-l', quantity: 1 }, { mnemeId: 'dispel-l', quantity: 1 }, { mnemeId: 'wisdom-breathtaker', quantity: 1 }] },
      ],
    },
    // === 移動 (MOVEMENT) ===
    {
      id: 'backstep-l', nameTw: '文理後跳', descriptionTw: '向後跳躍10碼',
      category: 'movement', roles: ['all'], iconId: 64623,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 50, range: 0, effectRange: 0, duration: null,
      recipes: [{ ingredients: [{ mnemeId: 'backstep-l', quantity: 1 }] }],
    },
    {
      id: 'swift-l', nameTw: '文理敏捷', descriptionTw: '大幅提高移動速度（10秒）',
      category: 'movement', roles: ['all'], iconId: 64643,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 900, range: 0, effectRange: 0, duration: '10秒',
      recipes: [
        { ingredients: [{ mnemeId: 'featherfoot-l', quantity: 2 }] },
        { ingredients: [{ mnemeId: 'backstep-l', quantity: 2 }, { mnemeId: 'featherfoot-l', quantity: 1 }] },
      ],
    },
    {
      id: 'stealth-l', nameTw: '文理潛行', descriptionTw: '進入隱身狀態，移動速度降低50%',
      category: 'movement', roles: ['all'], iconId: 64621,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 150, range: 0, effectRange: 0, duration: '永久',
      recipes: [
        { ingredients: [{ mnemeId: 'stealth-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-ordained', quantity: 1 }, { mnemeId: 'shell-l', quantity: 1 }] },
      ],
    },
    {
      id: 'aetherial-manipulation-l', nameTw: '文理乙太步', descriptionTw: '瞬間移動到目標身邊',
      category: 'movement', roles: ['all'], iconId: 64622,
      actionCategory: 'ability', cast100ms: 0, recast100ms: 50, range: 25, effectRange: 0, duration: null,
      recipes: [
        { ingredients: [{ mnemeId: 'backstep-l', quantity: 1 }, { mnemeId: 'stealth-l', quantity: 1 }] },
        { ingredients: [{ mnemeId: 'wisdom-martialist', quantity: 1 }, { mnemeId: 'backstep-l', quantity: 1 }, { mnemeId: 'feint-l', quantity: 1 }] },
      ],
    },
  ],
};

// === LOOKUP HELPERS ===

const logogramMap = new Map(eurekaData.logograms.map((l) => [l.id, l]));
const mnemeMap = new Map(eurekaData.mnemes.map((m) => [m.id, m]));

export function getLogogram(id: string): Logogram | undefined {
  return logogramMap.get(id);
}

export function getMneme(id: string): Mneme | undefined {
  return mnemeMap.get(id);
}

export function getLogogramForMneme(mnemeId: string): Logogram | undefined {
  const mneme = mnemeMap.get(mnemeId);
  if (!mneme) return undefined;
  return logogramMap.get(mneme.sourceLogogramId);
}
