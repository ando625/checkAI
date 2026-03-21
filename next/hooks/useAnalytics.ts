
import { useState, useEffect } from "react";

import type {
    AnalyticsSummary,
    WeeklyData,
    MonthlyData,
    StatusResponse,
    InsightsData,
} from '@/types/analytics';

type UseAnalyticsReturn = {
    summary: AnalyticsSummary | null; // カード用データ（取得前はnull）
    weekly: WeeklyData; // 週間グラフ用データ
    monthly: MonthlyData; // 月別グラフ用データ
    statusData: StatusResponse | null; // 円グラフ・横棒グラフ用データ
    insights: InsightsData | null;
    insightsLoading: boolean; // ★ AI分析専用のローディング状態
    loading: boolean; // 読み込み中かどうか
    error: string | null; // エラーメッセージ（なければnull）
};

// ★ キャッシュの有効時間（分）
const CACHE_MINUTES = 30;

export const useAnalytics = (): UseAnalyticsReturn => {
    // 各データの「箱」を用意する（最初は全部null）
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [weekly, setWeekly] = useState<WeeklyData>([]);
    const [monthly, setMonthly] = useState<MonthlyData>([]);
    const [statusData, setStatusData] = useState<StatusResponse | null>(null);
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true); // 最初はローディング中
    const [insightsLoading, setInsightsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchGraphData = async () => {
            try {
                setLoading(true);

                // 4つのAPIを同時に叩く（Promise.allで並列実行→速い）
                // ※ 順番に叩くより全部同時の方が速く取得できる
                const [summaryRes, weeklyRes, monthlyRes, statusRes] =
                    await Promise.all([
                        fetch('/api/analytics/summary', {
                            credentials: 'include',
                        }),
                        fetch('/api/analytics/weekly', {
                            credentials: 'include',
                        }),
                        fetch('/api/analytics/monthly', {
                            credentials: 'include',
                        }),
                        fetch('/api/analytics/status', {
                            credentials: 'include',
                        }),
                    ]);
                // credentials: 'include' = Cookieを一緒に送る（Sanctum認証に必要）

                // 1つでもエラーがあれば例外を投げる
                if (
                    !summaryRes.ok ||
                    !weeklyRes.ok ||
                    !monthlyRes.ok ||
                    !statusRes.ok
                ) {
                    throw new Error('データの取得に失敗しました');
                }

                //レスポンスを取得して各箱に入れる
                const [summaryData, weeklyData, monthlyData, statusData] =
                    await Promise.all([
                        summaryRes.json(),
                        weeklyRes.json(),
                        monthlyRes.json(),
                        statusRes.json(),
                    ]);

                // 各stateを更新（これで画面が再描画される）
                setSummary(summaryData);
                setWeekly(weeklyData);
                setMonthly(monthlyData);
                setStatusData(statusData);


            } catch (err) {
                setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };
        fetchGraphData();
    }, []);


    //AI分析
    useEffect(() => {
        const fetchInsights = async () => {
            setInsightsLoading(true);

            // ★ キャッシュ確認（sessionStorageはタブを閉じると消える）
            try {
                const cachedData = sessionStorage.getItem('insights_cache');
                const cachedAt   = sessionStorage.getItem('insights_cached_at');

                if (cachedData && cachedAt) {
                    // 保存した時刻から何分経ったか計算
                    const diffMinutes = (Date.now() - Number(cachedAt)) / 1000 / 60;

                    if (diffMinutes < CACHE_MINUTES) {
                        // ★ 30分以内ならAPIを呼ばずキャッシュを使う
                        setInsights(JSON.parse(cachedData));
                        setInsightsLoading(false);
                        return; // ← ここでfetchInsights終了（APIを呼ばない）
                    }
                }
            } catch {
                // sessionStorageが使えない環境でも壊れないようにする
            }

            // ★ キャッシュがない or 30分以上経った → APIを呼ぶ
            try {
                const insightsRes = await fetch(
                    'http://localhost/api/analytics/ai-insights',
                    { credentials: 'include' }
                );

                if (insightsRes.ok) {
                    const insightsData: InsightsData = await insightsRes.json();
                    setInsights(insightsData);

                    // ★ 取得したデータをキャッシュに保存
                    sessionStorage.setItem('insights_cache', JSON.stringify(insightsData));
                    sessionStorage.setItem('insights_cached_at', String(Date.now()));
                }
            } catch {
                // AI分析が失敗してもグラフ部分は壊れないようにする
            } finally {
                setInsightsLoading(false);
            }
        };

        fetchInsights();
    }, []);


    //フックを使う側が受け取れるようにする
    return {
        summary,
        weekly,
        monthly,
        statusData,
        insights,
        insightsLoading,
        loading,
        error,
    };
};