//上部４つのカード用の型（平均スコア・総報告数・ポジティブ率・リスク報告数）
export type AnalyticsSummary = {
    avg_score: number; // 平均スコア（例: 75.7）
    weekly_change: number; // 前週比（例: +3.2）
    total_reports: number; // 総報告数（例: 19）
    weekly_reports: number; // 今週の報告数
    positive_rate: number; // ポジティブ率（例: 66.7）
    risk_count: number; // リスク報告数（例: 1）
};

//週間スコア推移グラフ用の型(1日分のデータ)
export type WeeklyItem = {
    date: string; //2026-03-20 のような日付文字列
    score: number | null; //その日の平均スコア
};
export type WeeklyData = WeeklyItem[];
//「1件分の型」と「配列の型」を分けると、後でループするときに WeeklyItem を使えて便利

//月別平均スコアグラフ用の型(ひと月分のデータ)
export type MonthlyItem = {
    month: string; //2026-03　のような年月文字列
    score: number | null; //その月の平均スコア
};
export type MonthlyData = MonthlyItem[];

//ステータス分布グラフ用の型(報告別の円グラフ)
export type StatusDistributionItem = {
    status: string; //順調、リスクあり、要確認
    count: number; //件数
};

//感情スコア用の型
export type SentimentData = {
    positive: number;
    negative: number;
    neutral: number;
};

export type StatusResponse = {
    status_distribution: StatusDistributionItem[];
    sentiment: SentimentData;
};

export type TopicItem = {
    title: string;
    description: string;
    count: number;
    trend: '増加中' | '安定' | '減少中';
};

export type PredictionResult = {
    predicted_score: number;
    trend: '上昇' | '安定' | '下降';
    confidence: '高' | '中' | '低';
    reason: string;
    alert: boolean;
    alert_message: string | null;
    action: string;
};

export type SentimentResult = {
    joy: number;
    stress: number;
    confidence: number;
    concern: number;
};

export type InsightsData = {
    topics: TopicItem[];
    prediction: PredictionResult;
    sentiment: SentimentResult;
    overall_summary: string;
};