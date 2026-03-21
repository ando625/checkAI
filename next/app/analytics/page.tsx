// next/app/analytics/page.tsx
'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { Navbar } from '@/components/Navbar';
import type { StatusDistributionItem } from '@/types/analytics';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { BarChart2 } from 'lucide-react';



const STATUS_COLORS: Record<string, string> = {
    順調: '#22c55e',
    要確認: '#f97316',
    リスクあり: '#ef4444',
};

type SummaryCardProps = {
    title: string;
    value: string | number;
    sub?: string;
    color?: string;
};

const SummaryCard = ({ title, value, sub, color }: SummaryCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500 mb-2">{title}</p>
        <p className={`text-3xl font-bold ${color ?? 'text-gray-800'}`}>
            {value}
        </p>
        {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
    </div>
);

const trendColor: Record<string, string> = {
    上昇: 'text-green-600',
    安定: 'text-blue-600',
    下降: 'text-red-600',
};

export default function AnalyticsPage() {
    // ★ insightsLoading を追加で受け取る
    const {
        summary,
        weekly,
        monthly,
        statusData,
        insights,
        insightsLoading,
        loading,
        error,
    } = useAnalytics();

    // グラフデータのローディング中（AIは含まない）
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">データを読み込み中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const distribution: StatusDistributionItem[] =
        statusData?.status_distribution ?? [];

    const bestStatus = distribution.find((s) => s.status === '順調');

    const peakWeek =
        weekly.length > 0
            ? weekly.reduce(
                  (best, cur) =>
                      (cur.score ?? 0) > (best.score ?? 0) ? cur : best,
                  weekly[0],
              )
            : null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                <div className="flex items-center gep-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="ml-2 text-2xl font-bold text-gray-800">
                        分析データ
                    </h3>
                </div>

                {/* 上部4つのカード */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard
                        title="平均スコア"
                        value={summary?.avg_score ?? '-'}
                        sub={`前週比 ${(summary?.weekly_change ?? 0) > 0 ? '+' : ''}${summary?.weekly_change}`}
                        color="text-gray-800"
                    />
                    <SummaryCard
                        title="総報告数"
                        value={summary?.total_reports ?? '-'}
                        sub={`今週の報告数: ${summary?.weekly_reports}`}
                    />
                    <SummaryCard
                        title="ポジティブ率"
                        value={`${summary?.positive_rate ?? '-'}%`}
                        sub="順調な報告の割合"
                        color="text-green-600"
                    />
                    <SummaryCard
                        title="リスク報告"
                        value={summary?.risk_count ?? '-'}
                        sub="要対応の報告"
                        color="text-red-500"
                    />
                </div>

                {/* ★ 週間折れ線グラフ ＋ ステータス円グラフ（横並び） */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* 週間スコア推移（折れ線グラフ） */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            週間スコア推移
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={weekly}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    name="平均スコア"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    connectNulls={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </section>

                    {/* ステータス分布（円グラフ） */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            ステータス分布
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={(props: {
                                        name?: string;
                                        percent?: number;
                                    }) =>
                                        `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                >
                                    {distribution.map((entry) => (
                                        <Cell
                                            key={entry.status}
                                            fill={
                                                STATUS_COLORS[entry.status] ??
                                                '#94a3b8'
                                            }
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </section>
                </div>

                {/* ★ 月別棒グラフ ＋ 感情分析スコア（横並び） */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* 月別平均スコア（棒グラフ） */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            月別平均スコア
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthly}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="score"
                                    name="平均スコア"
                                    fill="#8b5cf6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </section>

                    {/* 感情分析スコア（横棒グラフ） */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            感情分析スコア
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={[
                                    {
                                        name: 'ポジティブ',
                                        value:
                                            statusData?.sentiment.positive ?? 0,
                                    },
                                    {
                                        name: 'ネガティブ',
                                        value:
                                            statusData?.sentiment.negative ?? 0,
                                    },
                                ]}
                                layout="vertical"
                                margin={{ left: 10 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    type="number"
                                    domain={[0, 'auto']}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={80}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="value"
                                    name="スコア"
                                    radius={[0, 4, 4, 0]}
                                >
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#ef4444" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </section>
                </div>

                {/* AIインサイト（簡易版） */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        AIインサイト
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 border-l-4 border-green-400 rounded-xl p-5 shadow-sm">
                            <p className="text-2xl mb-2">🏆</p>
                            <p className="font-semibold text-gray-800 mb-1">
                                ベストパフォーマンス
                            </p>
                            <p className="text-sm text-gray-600">
                                {bestStatus
                                    ? `順調な報告が ${bestStatus.count}件あります。`
                                    : '順調な報告のデータがありません'}
                            </p>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-5 shadow-sm">
                            <p className="text-2xl mb-2">📈</p>
                            <p className="font-semibold text-gray-800 mb-1">
                                最高スコア
                            </p>
                            <p className="text-sm text-gray-600">
                                {peakWeek && peakWeek.score !== null
                                    ? `${peakWeek.date}のスコアが ${peakWeek.score}点でピークでした。`
                                    : 'データが不足しています'}
                            </p>
                        </div>
                        <div className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-5 shadow-sm">
                            <p className="text-2xl mb-2">⚠️</p>
                            <p className="font-semibold text-gray-800 mb-1">
                                リスク傾向
                            </p>
                            <p className="text-sm text-gray-600">
                                {summary && summary.risk_count > 0
                                    ? `現在 ${summary.risk_count}件のリスク報告があります。`
                                    : '現在リスク報告はありません'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* AI詳細分析（Gemini・キャッシュあり） */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        AI詳細分析
                    </h3>

                    {/* ★ insightsLoading で AI専用のローディングを表示 */}
                    {insightsLoading ? (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
                            🤖
                            AIが分析中です...（初回のみ・結果は30分キャッシュされます）
                        </div>
                    ) : insights === null ? (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
                            AI分析データを取得できませんでした
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* 予測カード */}
                            <div
                                className={`rounded-xl p-5 shadow-sm border-l-4 ${
                                    insights.prediction.alert
                                        ? 'bg-red-50 border-red-400'
                                        : 'bg-blue-50 border-blue-400'
                                }`}
                            >
                                <p className="text-sm text-gray-500">
                                    来週の予測スコア
                                </p>
                                <p className="text-3xl font-bold mt-1">
                                    {insights.prediction.predicted_score}点
                                </p>
                                <p
                                    className={`text-sm font-medium mt-1 ${
                                        trendColor[insights.prediction.trend] ??
                                        'text-gray-600'
                                    }`}
                                >
                                    {insights.prediction.trend}傾向 （信頼度：
                                    {insights.prediction.confidence}）
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    {insights.prediction.reason}
                                </p>
                                {insights.prediction.alert && (
                                    <p className="text-red-600 font-semibold mt-2 text-sm">
                                        ⚠️ {insights.prediction.alert_message}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-3 border-t pt-2">
                                    推奨：{insights.prediction.action}
                                </p>
                            </div>

                            {/* AIの総評 */}
                            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl p-5 shadow-sm">
                                <p className="font-semibold text-gray-800 mb-1">
                                    🧠 AIの総評
                                </p>
                                <p className="text-sm text-gray-600">
                                    {insights.overall_summary}
                                </p>
                            </div>

                            {/* トピックカード */}
                            <div className="grid md:grid-cols-3 gap-4">
                                {insights.topics.map((topic) => (
                                    <div
                                        key={topic.title}
                                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-gray-800">
                                                {topic.title}
                                            </p>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                    topic.trend === '増加中'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : topic.trend ===
                                                            '減少中'
                                                          ? 'bg-green-100 text-green-700'
                                                          : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {topic.trend}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {topic.description}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {topic.count}件の報告
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
