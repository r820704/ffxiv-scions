import { Link } from 'react-router-dom';

const base = import.meta.env.BASE_URL;

export interface FeatureCardProps {
  to: string;
  accent: string;
  numeral: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
}

export default function FeatureCard({
  to,
  accent,
  numeral,
  eyebrow,
  title,
  description,
  cta,
}: FeatureCardProps) {
  return (
    <Link
      to={to}
      style={{ ['--accent' as string]: accent }}
      className="
        group relative isolate overflow-hidden
        flex flex-col
        aspect-[5/6.2]
        p-[22px] rounded-xl
        border border-[rgba(197,182,157,0.10)]
        bg-[#12101c]
        no-underline text-inherit
        transition-[transform,border-color,box-shadow] duration-300 ease-out
        hover:-translate-y-[5px]
        hover:border-[color-mix(in_oklab,var(--accent)_55%,rgba(197,182,157,0.10))]
        hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background
      "
    >
      <span
        aria-hidden
        className="
          absolute inset-0 z-0
          transition-[filter] duration-500 ease-out
          group-hover:brightness-[1.08]
        "
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 0%,
              color-mix(in oklab, var(--accent) 38%, transparent), transparent 65%),
            radial-gradient(ellipse 60% 30% at 30% 18%, rgba(255,255,255,0.10), transparent 60%),
            radial-gradient(ellipse 70% 30% at 80% 28%, rgba(255,255,255,0.06), transparent 60%),
            linear-gradient(180deg, #1a1530 0%, #12101c 65%)
          `,
        }}
      >
        <span
          className="absolute left-0 right-0 top-1/2 h-px opacity-60"
          style={{
            background:
              'linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 60%, transparent), transparent)',
          }}
        />
      </span>

      <div className="relative z-[2] flex items-center justify-between">
        <img
          src={`${base}brand/lantern-symbol.png`}
          alt=""
          width={28}
          height={28}
          loading="lazy"
          decoding="async"
          className="w-7 h-7 object-contain opacity-90 drop-shadow-[0_1px_6px_rgba(197,182,157,0.35)]"
        />
        <span
          className="text-[14px] tracking-[0.32em] opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          {numeral}
        </span>
      </div>

      <div className="relative z-[2] mt-auto flex flex-col gap-2">
        <span
          className="
            inline-flex items-center gap-2.5
            text-[10.5px] tracking-[0.32em] uppercase opacity-90
            before:content-[''] before:w-[22px] before:h-px
            before:bg-gradient-to-r before:from-transparent before:to-current
          "
          style={{ color: 'var(--accent)' }}
        >
          {eyebrow}
        </span>

        <h2 className="font-title m-0 text-[24px] leading-[1.05] tracking-[0.06em] font-semibold text-foreground">
          {title}
        </h2>

        <p className="font-title m-0 text-[13.5px] leading-[1.5] tracking-[0.04em] text-muted-foreground">
          {description}
        </p>

        <span
          className="
            mt-3.5 inline-flex items-center gap-2
            text-[12px] tracking-[0.22em] uppercase
            after:content-['→'] after:transition-transform after:duration-300
            group-hover:after:translate-x-[5px]
          "
          style={{ color: 'var(--accent)' }}
        >
          {cta}
        </span>
      </div>
    </Link>
  );
}
