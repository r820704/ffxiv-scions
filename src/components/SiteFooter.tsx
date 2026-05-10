export default function SiteFooter() {
  const noticesHref = `${import.meta.env.BASE_URL}THIRD-PARTY-NOTICES.md`;
  return (
    <footer className="mt-8 pt-4 border-t border-border/30 text-xs text-muted-foreground/70 text-center">
      © SQUARE ENIX ｜ 路過打聲招呼 ｜{' '}
      <a
        href={noticesHref}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-muted-foreground"
      >
        第三方資料致謝
      </a>
    </footer>
  );
}
