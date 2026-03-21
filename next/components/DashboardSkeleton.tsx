// ローディング中に表示するスケルトン（ガイコツ）UI
// データが来る前にレイアウトの「枠」だけ薄く表示して、
// 画面が一瞬真っ白になるのを防ぐ

// ├ 投稿フォームのスケルトン
// └ カードのスケルトン × 3枚

// アニメーションする灰色ブロックの共通パーツ
function SkeletonBlock({ className }: { className: string }) {
    return (
        <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />
    );
    // animate-pulse → Tailwindのアニメーション。じわじわ明滅する
}

// カード1枚分のスケルトン
function ReportCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            {/* ヘッダー行：アバター + 名前 + バッジ */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <SkeletonBlock className="w-11 h-11 rounded-full" />
                    <div className="space-y-2">
                        <SkeletonBlock className="w-24 h-3" />
                        <SkeletonBlock className="w-32 h-2" />
                    </div>
                </div>
                <SkeletonBlock className="w-16 h-6 rounded-full" />
            </div>

            {/* 本文 */}
            <div className="space-y-2">
                <SkeletonBlock className="w-full h-3" />
                <SkeletonBlock className="w-full h-3" />
                <SkeletonBlock className="w-3/4 h-3" />
            </div>

            {/* スコアパネル */}
            <SkeletonBlock className="w-full h-20 rounded-xl" />

            {/* ボタン行 */}
            <SkeletonBlock className="w-32 h-8 rounded-lg" />
        </div>
    );
}

// ページ全体のスケルトン（外から呼び出す）
export function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            {/* 投稿フォームのスケルトン */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <SkeletonBlock className="w-36 h-4" />
                <SkeletonBlock className="w-full h-20 rounded-xl" />
                <div className="flex justify-end">
                    <SkeletonBlock className="w-28 h-10 rounded-xl" />
                </div>
            </div>

            {/* セクションタイトル */}
            <SkeletonBlock className="w-20 h-4" />

            {/* カード × 3枚 */}
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
        </div>
    );
}
