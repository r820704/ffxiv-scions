const base = import.meta.env.BASE_URL;

const motes = Array.from({ length: 22 }, (_, i) => {
  const left = (i * 53) % 100;
  const drift = (((i * 37) % 80) - 40).toFixed(0) + 'px';
  const dur = (14 + ((i * 7) % 16)).toFixed(0) + 's';
  const delay = (-((i * 11) % 24)).toFixed(0) + 's';
  const twinkle = (2.4 + ((i * 13) % 30) / 10).toFixed(1) + 's';
  const peak = (0.45 + ((i * 17) % 50) / 100).toFixed(2);
  return { left: `${left}%`, drift, dur, delay, twinkle, peak };
});

export default function Hero() {
  return (
    <section
      aria-label="網站首頁標頭"
      className="hero-root relative w-full overflow-hidden isolate h-[clamp(480px,65vh,800px)]"
    >
      <style>{HERO_CSS}</style>

      <picture className="hero-media absolute inset-0 z-0">
        <img
          src={`${base}brand/hero-desktop.png`}
          alt=""
          width={1672}
          height={941}
          {...{ fetchpriority: 'high' }}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-right sm:object-[center_30%] block"
        />
      </picture>

      <div aria-hidden className="hero-mist absolute inset-0 z-[1] pointer-events-none" />

      <div aria-hidden className="hero-motes absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {motes.map((m, i) => (
          <span
            key={i}
            className="mote"
            style={
              {
                left: m.left,
                ['--drift' as string]: m.drift,
                ['--dur' as string]: m.dur,
                ['--delay' as string]: m.delay,
                ['--twinkle' as string]: m.twinkle,
                ['--peak' as string]: m.peak,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(18,16,28,0.15) 0%, rgba(18,16,28,0.55) 100%)',
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
        <h1
          translate="no"
          className="
            hero-title
            m-0 leading-[1]
            text-[clamp(2.5rem,6vw,4.5rem)]
            tracking-[0.08em]
            text-foreground
          "
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontWeight: 900,
            textShadow:
              '0 2px 18px rgba(0,0,0,0.55), 0 0 1px rgba(232,224,208,0.4)',
          }}
        >
          FFXIV&nbsp;SCIONS
        </h1>

        <p
          className="
            hero-description
            mt-[14px] mb-0 max-w-[42ch]
            text-[clamp(0.9rem,1.4vw,1.05rem)]
            tracking-[0.04em]
            text-foreground/85
          "
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}
        >
          Final&nbsp;Fantasy&nbsp;XIV 繁中伺服器優雷卡工具
        </p>

        <p
          className="
            hero-slogan
            font-title mt-[14px] m-0 max-w-[38ch]
            text-[clamp(1.1rem,2.2vw,1.5rem)]
            tracking-[0.2em]
            text-primary
          "
          style={{ textShadow: '0 1px 12px rgba(0,0,0,0.55)' }}
        >
          為你的冒險點一盞燈
        </p>
      </div>
    </section>
  );
}

const HERO_CSS = `
.hero-media img { will-change: transform; animation: heroKenBurns 42s ease-in-out infinite alternate; }

.hero-mist {
  mix-blend-mode: screen;
  background:
    radial-gradient(ellipse 50% 30% at 20% 25%, rgba(232,224,208,0.18), transparent 60%),
    radial-gradient(ellipse 40% 22% at 70% 18%, rgba(197,182,157,0.14), transparent 60%),
    radial-gradient(ellipse 35% 18% at 55% 35%, rgba(255,255,255,0.10), transparent 60%);
  background-size: 200% 100%;
  animation: heroMistDrift 56s linear infinite;
}

.hero-motes .mote {
  position: absolute;
  bottom: -10px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(232,224,208,0.85);
  box-shadow: 0 0 4px rgba(232,224,208,0.7), 0 0 10px rgba(197,182,157,0.45);
  opacity: 0;
  animation:
    heroMoteRise var(--dur, 18s) linear infinite,
    heroMoteTwinkle var(--twinkle, 3.2s) ease-in-out infinite;
  animation-delay: var(--delay, 0s), var(--delay, 0s);
}

.hero-title       { animation: heroTitleReveal 1.4s cubic-bezier(.2,.7,.2,1) both; }
.hero-description { animation: heroCopyReveal 1.0s 0.30s cubic-bezier(.2,.7,.2,1) both; }
.hero-slogan      { animation: heroCopyReveal 1.2s 0.55s cubic-bezier(.2,.7,.2,1) both; }

.hero-slogan::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #C5B69D;
  transform: rotate(45deg);
  margin-right: 14px;
  vertical-align: middle;
  box-shadow: 0 0 8px rgba(197, 182, 157, 0.6);
  position: relative;
  top: -3px;
}

@keyframes heroKenBurns {
  0%   { transform: scale(1.00) translate3d(0, 0, 0); }
  100% { transform: scale(1.07) translate3d(-1.5%, -1%, 0); }
}
@keyframes heroMistDrift {
  0%   { background-position: 0% 0%; }
  100% { background-position: 100% 0%; }
}
@keyframes heroMoteRise {
  0%   { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(var(--drift, 30px), -110vh, 0); }
}
@keyframes heroMoteTwinkle {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: var(--peak, 0.7); }
  50%      { opacity: 0; }
}
@keyframes heroTitleReveal {
  0%   { opacity: 0; letter-spacing: 0.22em; transform: translateY(8px); filter: blur(4px); }
  60%  { opacity: 1; filter: blur(0); }
  100% { opacity: 1; letter-spacing: 0.08em; transform: translateY(0); filter: blur(0); }
}
@keyframes heroCopyReveal {
  0%   { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-media img,
  .hero-mist,
  .hero-motes .mote,
  .hero-title,
  .hero-description,
  .hero-slogan {
    animation: none !important;
  }
}
`;
