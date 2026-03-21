//小さな共通パーツ　ボタンやスコアパネルデザイン

// ReportUI.tsx

// ├ StatusBadge   ← 日報の状態（順調 / リスクあり）
// │
// └ ScorePanel    ← スコア表示パネル
//       ├ 総合スコア
//       ├ ポジティブ
//       └ ネガティブ

import { ReportStatus } from "@/types/report";

//名前アバター　名前から2文字取り出して丸アイコンにする部品
export function Avatar({ name, userId, size = 44 }: { name: string; userId: number; size?: number }) {
    //背景色リスト：ユーザーIDによって色を固定する
    const colors = [
        '#e8a598',
        '#a0b4c8',
        '#a8c5a0',
        '#c5a8c0',
        '#c8b89a',
        '#98b4c8',
    ];

    //名前の最初の文字を取り出す
    const initials = name.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div
            className="rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
            style={{
                width: size,
                height: size,
                backgroundColor: colors[userId % colors.length],
                fontSize: size * 0.45
            }}
        >
            {initials}
        </div>
    );
}



//ステータスバッジ
export function StatusBadge({ status }: { status: ReportStatus }) {
    const styles: Record<ReportStatus, string> = {
        順調: 'text-green-600 bg-green-50 border-green-200',
        リスクあり: 'text-red-600 bg-red-50 border-red-200',
        要確認: 'text-amber-600 bg-amber-50 border-amber-200',
    };
    return (
        <span className={`px-5.5 py-2 rounded-full font-medium border ${styles[status]}`}>
            {status}
        </span>
    );
}


//スコア　総合・ポジティブ・ネガティブ数値 |総合|ポジ|ネガ|
export function ScorePanel({ total, positive, negative }: { total: number; positive: number; negative: number }) {
    return (
        <div className="rounded-xl grid grid-cols-3 divide-x divide-blue-100 bg-blue-50/50">
            <div className="px-6 py-4 text-center">
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                    総合スコア
                </p>
                <p className="text-2xl font-bold text-blue-600">{total}</p>
            </div>
            <div className="px-6 py-4 text-center">
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                    ポジティブ
                </p>
                <p className="text-2xl font-bold text-green-600">+{positive}</p>
            </div>
            <div className="px-6 py-4 text-center">
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                    ネガティブ
                </p>
                <p className="text-2xl font-bold text-red-600">-{negative}</p>
            </div>
        </div>
    );
}