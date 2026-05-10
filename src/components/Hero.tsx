const base = import.meta.env.BASE_URL;

export default function Hero() {
  return (
    <section
      aria-label="hero"
      className="relative w-full overflow-hidden isolate h-[clamp(420px,60vh,720px)]"
    >
      <picture className="absolute inset-0 z-0">
        <source media="(max-width: 640px)" srcSet={`${base}brand/hero-mobile.png`} />
        <img
          src={`${base}brand/hero-desktop.png`}
          alt=""
          {...{ fetchpriority: 'high' }}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-[center_30%] block"
        />
      </picture>

      <div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(18,16,28,0.20) 0%, rgba(18,16,28,0.65) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none mix-blend-multiply"
        style={{
          background:
            'radial-gradient(ellipse 70% 90% at 25% 70%, rgba(18,16,28,0.55), transparent 60%)',
        }}
      />

      <div
        className="
          relative z-[2] mx-auto h-full w-full
          max-w-[1280px] px-6 sm:px-8
          flex flex-col justify-end
          items-center text-center
          sm:items-start sm:text-left
          pb-[clamp(28px,8vh,56px)] sm:pb-[clamp(36px,7vh,88px)]
        "
      >
        <div
          className="
            hidden sm:inline-flex items-center gap-3
            text-[12px] tracking-[0.32em] uppercase
            text-primary/90 mb-4
            before:content-[''] before:w-9 before:h-px
            before:bg-gradient-to-r before:from-transparent before:to-primary
          "
        >
          Mana · Final Fantasy XIV
        </div>

        <h1
          className="
            font-title m-0 leading-[1] font-semibold
            text-[clamp(2.5rem,6vw,4.5rem)]
            tracking-[0.08em]
            text-foreground
          "
          style={{
            textShadow:
              '0 2px 18px rgba(0,0,0,0.55), 0 0 1px rgba(232,224,208,0.4)',
          }}
        >
          FFXIV&nbsp;SCIONS
        </h1>

        <p
          className="
            font-title mt-[18px] mb-2 max-w-[38ch]
            text-[clamp(1.1rem,2.2vw,1.5rem)]
            tracking-[0.2em]
            text-primary
          "
          style={{ textShadow: '0 1px 12px rgba(0,0,0,0.55)' }}
        >
          為你的冒險點一盞燈
        </p>

        <p
          className="
            italic m-0 opacity-70
            text-[clamp(0.85rem,1.2vw,1rem)]
            tracking-[0.06em]
            text-muted-foreground
          "
        >
          A Light for the Path Ahead
        </p>
      </div>
    </section>
  );
}
