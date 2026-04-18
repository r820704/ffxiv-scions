import { Link } from 'react-router-dom';
import OzmaLogo from '@/components/OzmaLogo';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-6 mt-8">
      {/* Hero */}
      <div className="text-center">
        <div className="animate-float mb-4 inline-block">
          <OzmaLogo size={130} />
        </div>
        <h1 className="font-title text-3xl font-bold text-primary">
          FFXIV 巴爾德西昂
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Final Fantasy XIV 繁中伺服器優雷卡工具
        </p>
        {/* Diamond divider */}
        <div className="flex items-center justify-center gap-3 mt-6 max-w-[300px] mx-auto">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #3a3252, transparent)' }} />
          <div className="w-1.5 h-1.5 bg-primary rotate-45 opacity-60" />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #3a3252, transparent)' }} />
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[580px]">
        <Link
          to="/eureka-weather"
          className="block rounded-[10px] border border-border bg-card p-7 hover:border-[#3a3252] hover:-translate-y-0.5 hover:shadow-lg transition-all relative overflow-hidden group"
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #4A9BD9, #5BAE5B, #B8922E)' }}
          />
          <h2 className="text-lg font-semibold text-foreground mb-2">優雷卡天氣</h2>
          <p className="text-sm text-muted-foreground">優雷卡四地圖天氣時間軸、NM 出現時段與日夜指示</p>
        </Link>
        <Link
          to="/eureka"
          className="block rounded-[10px] border border-border bg-card p-7 hover:border-[#3a3252] hover:-translate-y-0.5 hover:shadow-lg transition-all relative overflow-hidden group"
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #C43E3E, #8B5FC7, #4A9BD9)' }}
          />
          <h2 className="text-lg font-semibold text-foreground mb-2">文理技能</h2>
          <p className="text-sm text-muted-foreground">Eureka 文理技能查詢、材料反查與市場價格</p>
        </Link>
      </div>
    </div>
  );
}
