import HelpDialog, { HelpSection } from '@/components/HelpDialog';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <HelpDialog
      isOpen={isOpen}
      onClose={onClose}
      title="禁地兵裝 — 使用說明"
      srDescription="禁地兵裝武器與防具的階段與屬性說明"
    >
      <HelpSection title="什麼是禁地兵裝">
        <p className="text-muted-foreground">
          <strong className="text-foreground">禁地兵裝</strong>是 4.x（紅蓮解放者）的武器與套裝系列，玩家在禁地優雷卡的四個區域累積元素等級與素材，最終可獲得帶有優雷卡元素加持屬性的武器及裝備，部分形態具有發光特效。
        </p>
      </HelpSection>
      <HelpSection title="三條升級鏈">
        <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-muted-foreground">
          <li>
            <strong className="text-foreground">武器</strong>（依職業，共 16 階段，最終階段 iL405，帶有優雷卡元素加持屬性）
          </li>
          <li>
            <strong className="text-foreground">常風防具</strong>（外觀專用，不影響角色能力值，各職業獨立，共 5 階段，最終階段為可染色的 Lv.70 職業套裝）
          </li>
          <li>
            <strong className="text-foreground">元素防具</strong>（戰鬥用，共 3 階段，依職能共用——同職能玩家共享同一套外觀，最終階段 iL390，帶有優雷卡元素加持屬性）
          </li>
        </ul>
      </HelpSection>
      <HelpSection title="優雷卡元素加持">
        <p className="text-muted-foreground">
          在優雷卡區域內均衡提升六種元素屬性，影響傷害計算。
        </p>
      </HelpSection>
      <HelpSection title="發光標示">
        <p className="text-muted-foreground inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block w-2.5 h-2.5 rounded-full bg-glow shadow-[0_0_4px_2px_rgba(251,191,36,0.6)]"
          />
          <span className="text-glow/90">帶光暈</span>＝遊戲中會發光（後續同模型再強化的階段不另外標）
        </p>
      </HelpSection>
    </HelpDialog>
  );
}
