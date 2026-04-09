import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-6 mt-8">
      <h1 className="text-3xl font-bold text-primary">FFXIV 工具箱</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Link
          to="/weather"
          className="block rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
        >
          <h2 className="text-lg font-semibold text-foreground mb-2">天氣查詢</h2>
          <p className="text-sm text-muted-foreground">查詢各地區天氣預報與篩選特定天氣時段</p>
        </Link>
        <Link
          to="/eureka"
          className="block rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
        >
          <h2 className="text-lg font-semibold text-foreground mb-2">文理技能</h2>
          <p className="text-sm text-muted-foreground">Eureka 文理技能查詢、材料反查與市場價格</p>
        </Link>
      </div>
    </div>
  );
}
