import PageHead from '@/components/PageHead';

const base = import.meta.env.BASE_URL;

interface ServerRow {
  region: string;
  world: string;
  id: string;
}

const SERVERS: ServerRow[] = [
  { region: 'TC', world: '迦樓羅', id: 'Skuld' },
  { region: 'CN', world: '柔风海湾', id: 'Skuld' },
];

export default function AboutPage() {
  return (
    <>
      <PageHead title="關於作者" />

      <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,420px)_1fr] gap-8 lg:gap-12 items-start">
        <figure className="relative rounded-xl overflow-hidden border border-[rgba(197,182,157,0.18)] shadow-[0_20px_50px_-22px_rgba(0,0,0,0.85)]">
          <img
            src={`${base}brand/author-portrait.webp`}
            alt="作者角色 Skuld 的肖像"
            width={1672}
            height={941}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block"
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 60%, rgba(18,16,28,0.45) 100%)',
            }}
          />
        </figure>

        <section className="flex flex-col gap-7">
          <div>
            <h2 className="font-title text-xl text-primary tracking-[0.06em] m-0 mb-1 inline-flex items-center gap-3">
              <span
                aria-hidden
                className="block w-2 h-2 rotate-45 bg-primary shadow-[0_0_8px_rgba(197,182,157,0.5)]"
              />
              作者簡介
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              目前在以下兩個伺服器活動：
            </p>
          </div>

          <dl className="grid grid-cols-[auto_1fr_1fr] gap-x-5 gap-y-3 text-sm">
            <div className="contents">
              <dt className="text-xs text-muted-foreground tracking-wider self-center">伺服器</dt>
              <dt className="text-xs text-muted-foreground tracking-wider">World</dt>
              <dt className="text-xs text-muted-foreground tracking-wider">遊戲 ID</dt>
            </div>
            {SERVERS.map((s) => (
              <div key={s.region} className="contents">
                <dd className="font-mono text-sm text-primary self-center">{s.region}</dd>
                <dd className="font-title text-base text-foreground self-center">{s.world}</dd>
                <dd
                  translate="no"
                  className="font-title text-base text-foreground self-center"
                >
                  {s.id}
                </dd>
              </div>
            ))}
          </dl>

          <blockquote className="relative mt-2 pl-5 border-l-2 border-primary/60 italic text-foreground/85 leading-relaxed">
            希望這工具有幫助到你，路上看到歡迎打招呼。
          </blockquote>
        </section>
      </div>
    </>
  );
}
