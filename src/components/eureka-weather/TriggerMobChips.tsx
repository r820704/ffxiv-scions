// Eureka element icons sourced from consolegameswiki, see THIRD-PARTY-NOTICES.md.
import fireIcon from '@/assets/eureka-element-icons/Fire.png';
import iceIcon from '@/assets/eureka-element-icons/Ice.png';
import windIcon from '@/assets/eureka-element-icons/Wind.png';
import earthIcon from '@/assets/eureka-element-icons/Earth.png';
import lightningIcon from '@/assets/eureka-element-icons/Lightning.png';
import waterIcon from '@/assets/eureka-element-icons/Water.png';

type Element = 'Fire' | 'Ice' | 'Wind' | 'Earth' | 'Lightning' | 'Water';

const ELEMENT_ICON: Record<Element, string> = {
  Fire: fireIcon,
  Ice: iceIcon,
  Wind: windIcon,
  Earth: earthIcon,
  Lightning: lightningIcon,
  Water: waterIcon,
};

const ELEMENT_LABEL_TW: Record<Element, string> = {
  Fire: '火屬性',
  Ice: '冰屬性',
  Wind: '風屬性',
  Earth: '土屬性',
  Lightning: '雷屬性',
  Water: '水屬性',
};

interface TriggerMobChipsProps {
  attrs: {
    level: number;
    element?: Element;
    timeOfDay?: 'day' | 'night';
  };
}

export default function TriggerMobChips({ attrs }: TriggerMobChipsProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground text-[11px]">
        Lv.{attrs.level}
      </span>
      {attrs.element && (
        <img
          src={ELEMENT_ICON[attrs.element]}
          alt={ELEMENT_LABEL_TW[attrs.element]}
          width={14}
          height={14}
          className="inline-block shrink-0"
          loading="lazy"
        />
      )}
      {attrs.timeOfDay === 'night' && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-200 text-[11px]">
          夜間
        </span>
      )}
      {attrs.timeOfDay === 'day' && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-200 text-[11px]">
          白天
        </span>
      )}
    </span>
  );
}
