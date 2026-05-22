import { describe, it, expect } from 'vitest';
import {
  computeRowState,
  computeConditionStatus,
  cdRemainMs,
  isCdReady,
  isMobConditionMet,
  isNmConditionMet,
  isNmConditionSoon,
} from './nm-tracker-state';
import type { EurekaNm } from '@/data/eureka-nm-data';
import type { StateCtx } from './nm-tracker-state';

// Anchor frozen timestamp (Unix ms). Tests use this as 'now' baseline.
function at(hhmm: string): number {
  const parts = hhmm.split(':').map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const d = new Date('2026-05-19T00:00:00Z');
  d.setUTCHours(h, m, 0, 0);
  return d.getTime();
}

const pazuzu: EurekaNm = {
  id: 'pazuzu',
  nameTw: '帕祖祖',
  nameEn: 'Pazuzu',
  zone: 'Eureka Anemos',
  level: 20,
  trigger: { nm: { weather: ['Gales'] }, mob: { timeOfDay: 'night' } },
};

const sabotender: EurekaNm = {  // 常駐
  id: 'sabotender-corrido',
  nameTw: '寇里多仙人掌怪',
  nameEn: 'Sabotender Corrido',
  zone: 'Eureka Anemos',
  level: 1,
};

const cassie: EurekaNm = {
  id: 'copycat-cassie',
  nameTw: '複製魔花凱西',
  nameEn: 'Copycat Cassie',
  zone: 'Eureka Pagos',
  level: 36,
  trigger: { nm: { weather: ['Blizzards'] } },
};

const jahannam: EurekaNm = {  // only mob condition
  id: 'jahannam',
  nameTw: '哲罕南',
  nameEn: 'Jahannam',
  zone: 'Eureka Anemos',
  level: 7,
  trigger: { mob: { weather: ['Gales'] } },
};

describe('cdRemainMs', () => {
  it('returns null when popAt undefined', () => {
    expect(cdRemainMs(undefined, at('10:00'))).toBeNull();
  });
  it('returns 0 when CD already expired', () => {
    expect(cdRemainMs(at('07:00'), at('10:00'))).toBe(0);
  });
  it('returns remaining ms within CD window', () => {
    expect(cdRemainMs(at('09:00'), at('10:00'))).toBe(60 * 60 * 1000);
  });
});

describe('isCdReady', () => {
  it('true when popAt missing', () => expect(isCdReady(undefined, at('10:00'))).toBe(true));
  it('true when CD expired', () => expect(isCdReady(at('07:00'), at('10:00'))).toBe(true));
  it('false when CD running', () => expect(isCdReady(at('09:30'), at('10:00'))).toBe(false));
});

describe('isMobConditionMet', () => {
  it('returns true for NM without mob condition (常駐)', () => {
    const ctx: StateCtx = { isNight: true, isWeather: () => false, minutesToWeather: () => 999, msToTransition: 999_999 };
    expect(isMobConditionMet(sabotender, ctx)).toBe(true);
  });
  it('returns true for pazuzu at night (mob=night)', () => {
    const ctx: StateCtx = { isNight: true, isWeather: () => false, minutesToWeather: () => 999, msToTransition: 999_999 };
    expect(isMobConditionMet(pazuzu, ctx)).toBe(true);
  });
  it('returns false for pazuzu at day', () => {
    const ctx: StateCtx = { isNight: false, isWeather: () => false, minutesToWeather: () => 999, msToTransition: 999_999 };
    expect(isMobConditionMet(pazuzu, ctx)).toBe(false);
  });
  it('weather mob condition: jahannam needs Gales', () => {
    const yes: StateCtx = { isNight: false, isWeather: (w) => w === 'Gales', minutesToWeather: () => 0, msToTransition: 999_999 };
    const no: StateCtx = { isNight: false, isWeather: () => false, minutesToWeather: () => 30, msToTransition: 999_999 };
    expect(isMobConditionMet(jahannam, yes)).toBe(true);
    expect(isMobConditionMet(jahannam, no)).toBe(false);
  });
});

describe('isNmConditionMet', () => {
  it('returns true for NM without nm condition (mob-only)', () => {
    const ctx: StateCtx = { isNight: false, isWeather: () => false, minutesToWeather: () => 999, msToTransition: 999_999 };
    expect(isNmConditionMet(jahannam, ctx)).toBe(true);
  });
  it('cassie needs Blizzards', () => {
    const yes: StateCtx = { isNight: false, isWeather: (w) => w === 'Blizzards', minutesToWeather: () => 0, msToTransition: 999_999 };
    const no: StateCtx = { isNight: false, isWeather: () => false, minutesToWeather: () => 30, msToTransition: 999_999 };
    expect(isNmConditionMet(cassie, yes)).toBe(true);
    expect(isNmConditionMet(cassie, no)).toBe(false);
  });
});

describe('isNmConditionSoon', () => {
  it('returns false when no nm condition', () => {
    const ctx: StateCtx = { isNight: false, isWeather: () => false, minutesToWeather: () => 3, msToTransition: 999_999 };
    expect(isNmConditionSoon(jahannam, ctx)).toBe(false);
  });
  it('returns true when weather opens within 5 min', () => {
    const ctx: StateCtx = { isNight: false, isWeather: () => false, minutesToWeather: () => 3, msToTransition: 999_999 };
    expect(isNmConditionSoon(cassie, ctx)).toBe(true);
  });
  it('returns false when weather > 5 min away', () => {
    const ctx: StateCtx = { isNight: false, isWeather: () => false, minutesToWeather: () => 30, msToTransition: 999_999 };
    expect(isNmConditionSoon(cassie, ctx)).toBe(false);
  });
  it('returns false when already active (minutesToWeather=0)', () => {
    const ctx: StateCtx = { isNight: false, isWeather: () => true, minutesToWeather: () => 0, msToTransition: 999_999 };
    expect(isNmConditionSoon(cassie, ctx)).toBe(false);
  });
});

describe('computeRowState — 常駐 NM (rule B)', () => {
  it('未追蹤 → neutral', () => {
    expect(computeRowState(sabotender, { popAt: undefined }, at('10:00'))).toBe('neutral');
  });
  it('CD 進行中 → neutral', () => {
    expect(computeRowState(sabotender, { popAt: at('09:30') }, at('10:00'))).toBe('neutral');
  });
  it('CD 已過 → green', () => {
    expect(computeRowState(sabotender, { popAt: at('07:00') }, at('10:00'))).toBe('green');
  });
});

describe('computeRowState — 有條件 NM (pazuzu)', () => {
  it('全條件 ✓ + 未追蹤 → green', () => {
    const ctx: StateCtx = { isNight: true, isWeather: (w) => w === 'Gales', minutesToWeather: () => 0, msToTransition: 999_999 };
    expect(computeRowState(pazuzu, { popAt: undefined }, at('02:00'), ctx)).toBe('green');
  });
  it('mob ✓ + nm 5min 內 → amber', () => {
    const ctx: StateCtx = { isNight: true, isWeather: () => false, minutesToWeather: () => 3, msToTransition: 999_999 };
    expect(computeRowState(pazuzu, { popAt: undefined }, at('02:00'), ctx)).toBe('amber');
  });
  it('mob ✓ + nm 不符 + 不即將 → neutral', () => {
    const ctx: StateCtx = { isNight: true, isWeather: () => false, minutesToWeather: () => 30, msToTransition: 999_999 };
    expect(computeRowState(pazuzu, { popAt: undefined }, at('02:00'), ctx)).toBe('neutral');
  });
  it('mob ✗ → neutral even if NM ✓', () => {
    const ctx: StateCtx = { isNight: false, isWeather: () => true, minutesToWeather: () => 0, msToTransition: 999_999 };
    expect(computeRowState(pazuzu, { popAt: undefined }, at('12:00'), ctx)).toBe('neutral');
  });
  it('CD 進行中 → neutral even if all conditions ✓', () => {
    const ctx: StateCtx = { isNight: true, isWeather: () => true, minutesToWeather: () => 0, msToTransition: 999_999 };
    expect(computeRowState(pazuzu, { popAt: at('01:30') }, at('02:00'), ctx)).toBe('neutral');
  });
});

describe('computeRowState — NM 條件 only (cassie)', () => {
  it('Blizzards ✓ → green', () => {
    const ctx: StateCtx = { isNight: false, isWeather: (w) => w === 'Blizzards', minutesToWeather: () => 0, msToTransition: 999_999 };
    expect(computeRowState(cassie, { popAt: undefined }, at('10:00'), ctx)).toBe('green');
  });
  it('Blizzards 4 min 後 → amber (mob 無條件 視為 ✓)', () => {
    const ctx: StateCtx = { isNight: false, isWeather: () => false, minutesToWeather: () => 4, msToTransition: 999_999 };
    expect(computeRowState(cassie, { popAt: undefined }, at('10:00'), ctx)).toBe('amber');
  });
});

describe('computeConditionStatus', () => {
  it('returns met when condition matches now', () => {
    expect(computeConditionStatus({ weather: ['Gales'] }, {
      isWeather: (w) => w === 'Gales', minutesToWeather: () => 0, msToTransition: 999_999, isNight: false,
    })).toBe('met');
  });
  it('returns soon when within 10 min', () => {
    expect(computeConditionStatus({ weather: ['Gales'] }, {
      isWeather: () => false, minutesToWeather: () => 3, msToTransition: 999_999, isNight: false,
    })).toBe('soon');
  });
  it('returns distant when > 10 min but finite', () => {
    expect(computeConditionStatus({ weather: ['Gales'] }, {
      isWeather: () => false, minutesToWeather: () => 30, msToTransition: 999_999, isNight: false,
    })).toBe('distant');
  });
  it('returns idle when no upcoming occurrence (infinite)', () => {
    expect(computeConditionStatus({ weather: ['Gales'] }, {
      isWeather: () => false, minutesToWeather: () => Number.POSITIVE_INFINITY, msToTransition: 999_999, isNight: false,
    })).toBe('idle');
  });
  it('night condition met when isNight=true', () => {
    expect(computeConditionStatus({ timeOfDay: 'night' }, {
      isWeather: () => false, minutesToWeather: () => 0, msToTransition: 999_999, isNight: true,
    })).toBe('met');
  });
  it('day condition met when isNight=false', () => {
    expect(computeConditionStatus({ timeOfDay: 'day' }, {
      isWeather: () => false, minutesToWeather: () => 0, msToTransition: 999_999, isNight: false,
    })).toBe('met');
  });
  it('night condition during day → soon when transition within threshold', () => {
    expect(computeConditionStatus({ timeOfDay: 'night' }, {
      isWeather: () => false, minutesToWeather: () => 0, msToTransition: 3 * 60_000, isNight: false,
    })).toBe('soon');
  });
  it('night condition during day → distant when transition is far away', () => {
    expect(computeConditionStatus({ timeOfDay: 'night' }, {
      isWeather: () => false, minutesToWeather: () => 0, msToTransition: 25 * 60_000, isNight: false,
    })).toBe('distant');
  });
  it('day condition during night → soon when transition within threshold', () => {
    expect(computeConditionStatus({ timeOfDay: 'day' }, {
      isWeather: () => false, minutesToWeather: () => 0, msToTransition: 1 * 60_000, isNight: true,
    })).toBe('soon');
  });
});
