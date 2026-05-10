import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="max-w-[1280px] mx-auto px-4 mt-16 sm:mt-20">
        <section
          aria-label="工具"
          className="grid gap-[22px] sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          <FeatureCard
            to="/eureka-weather"
            accent="var(--c-eureka)"
            numeral="Ⅰ"
            eyebrow="Tool · Ⅰ"
            title="優雷卡天氣"
            description="優雷卡四地圖天氣時間軸、NM 出現時段與日夜指示"
            cta="開啟天氣表"
          />
          <FeatureCard
            to="/eureka"
            accent="var(--c-skill)"
            numeral="Ⅱ"
            eyebrow="Tool · Ⅱ"
            title="文理技能"
            description="優雷卡文理技能查詢、材料反查與市場價格"
            cta="查閱技能"
          />
          <FeatureCard
            to="/eureka-gear"
            accent="var(--c-bozja)"
            numeral="Ⅲ"
            eyebrow="Tool · Ⅲ"
            title="禁地兵裝"
            description="優雷卡武器與防具升級進度追蹤"
            cta="規劃路線"
          />
        </section>
      </div>
    </>
  );
}
