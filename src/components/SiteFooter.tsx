import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const noticesHref = `${import.meta.env.BASE_URL}THIRD-PARTY-NOTICES.md`;
  return (
    <footer className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground/70 text-center">
      © SQUARE ENIX ｜{' '}
      <Link
        to="/about"
        className="underline hover:text-muted-foreground"
      >
        路過打聲招呼
      </Link>
      ：TC 迦樓羅 Skuld · CN 柔风海湾 Skuld ｜{' '}
      <a
        href={noticesHref}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-muted-foreground"
      >
        第三方資料致謝
      </a>
      {' '}｜{' '}
      <span
        className="text-muted-foreground/50"
        title={__APP_VERSION_SUFFIX__ ? `領先 v${__APP_VERSION__} 標籤（開發中變更）` : undefined}
      >
        v{__APP_VERSION__}{__APP_VERSION_SUFFIX__}
      </span>
    </footer>
  );
}
