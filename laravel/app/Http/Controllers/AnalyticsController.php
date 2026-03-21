<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Carbon\Carbon;
use App\Models\Report;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AnalyticsController extends Controller
{
    /**
     * 上部4つのカード用データ
     * 平均スコア・総報告数・ポジティブ率・リスク報告数
     */
    public function summary(): JsonResponse{

        //今週の月曜日を取得
        $weekStart = Carbon::now()->startOfWeek();

        //reportsテーブルから集計
        $totalReports = Report::count();
        //全件のscore_totalカラムの平均値を計算
        $avgScore = round(Report::avg('score_total') ?? 0, 1);
        //今週（月曜日以降）に作られた報告件数
        $weeklyReports =Report::where('created_at', '>=', $weekStart)->count();
        //statusが順調の件数
        $positiveCount = Report::where('status', '順調')->count();
        //statusがリスク有りの件数
        $riskCount = Report::where('status', 'リスクあり')->count();

        //ポジティブ率を計算
        $positiveRate = $totalReports > 0
            ? round(($positiveCount / $totalReports) * 100, 1)
            : 0;

        //先週の平均スコアを計算して前週比を出す
        $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
        $lastWeekEnd = Carbon::now()->subWeek()->endOfWeek();
        $lastWeekAvg = round(
            Report::whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])
                ->avg('score_total') ?? 0,
                1
        );

        //今週平均 - 先週平均＝前週比
        $weeklyChange = round($avgScore - $lastWeekAvg, 1);

        return response()->json([
            'avg_score' => $avgScore,
            'weekly_change' => $weeklyChange,
            'total_reports' => $totalReports,
            'weekly_reports' => $weeklyReports,
            'positive_rate' => $positiveRate,
            'risk_count' => $riskCount,
        ]);
    }

    /**
     * 週間スコア推移グラフ用データ
     * 過去7日間、日ごとの平均スコアを返す
     */
    public function weekly(): JsonResponse
    {
        $days = [];

        //6日前〜今日まで、1日ずつループ（計７日間）
        for ($i = 6; $i >= 0; $i--){
            //$i日前の開始と終了を計算
            $date = Carbon::now()->subDays($i);
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();

            //その日の報告の平均スコアを取得
            $avg = Report::whereBetween('created_at', [$dayStart, $dayEnd])
                ->avg('score_total');

            //日付と平均スコアを配列に追加
            $days[] = [
                'date' => $date->format('m/d'),
                'score' => $avg ? round($avg, 1) : null,
            ];
        }

        return response()->json($days);
    }


    /**
     * 月別平均スコアグラフ用データ
     * 過去4ヶ月分を返す
     */
    public function monthly(): JsonResponse
    {
        $months = [];

        //３ヶ月前〜今月まで、１ヶ月ずつループ（計４ヶ月）
        for ($i = 3; $i >= 0; $i--){
            $month = Carbon::now()->subMonth($i);

            //その月の平均スコア取得
            $avg = Report::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->avg('score_total');

            $months[] = [
                'month' => $month->format('n月'),
                'score' => $avg ? round($avg, 1) : null,
            ];
        }

        return response()->json($months);
    }

    /**
     * ステータス分布 & 感情分析スコア用データ
     * 円グラフと横棒グラフの両方に使う
     */
    public function status(): JsonResponse
    {
        // statusカラムの値ごとに件数を集計
        // groupBy('status') = 同じstatusをグループにまとめる
        // selectRaw = SQL関数（COUNT）を直接書く
        $statusCounts = Report::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();


        $sentimentData = [
            'positive' => (int) Report::sum('score_positive'),  // 合計値
            'negative' => (int) Report::sum('score_negative'),  // 合計値
        ];

        return response()->json([
            'status_distribution' => $statusCounts, //円グラフ用
            'sentiment' => $sentimentData,  //横棒グラフ用
        ]);
    }


    public function aiInsights(): JsonResponse
    {
        //データを集める
        //最新３０件の報告テキスト
        $reports = Report::latest()
            ->take(30)
            ->pluck('content')
            ->toArray();

        //週間スコア
        $weeklyScores = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $avg = Report::whereBetween('created_at', [
                $date->copy()->startOfDay(),
                $date->copy()->endOfDay(),
            ])->avg('score_total');

            $weeklyScores[] = [
                'date' => $date->format('m/d'),
                'score' => $avg ? round($avg, 1) : null,
            ];
        }

        //月別スコア
        $monthlyScores = [];
        for ($i = 3; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $avg = Report::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->avg('score_total');

            $monthlyScores[] = [
                'month' => $month->format('n月'),
                'score' => $avg ? round($avg, 1) : null,
            ];
        }

        $currentAvg = round(Report::avg('score_total') ?? 0, 1);
        $riskCount = Report::where('status', 'リスクあり')->count();

        //Pythonに送る
        try{
            $response = Http::timeout(60)
                ->post('http://python:8000/insights', [
                    'reports' => $reports,
                    'weekly_scores' => $weeklyScores,
                    'monthly_scores' => $monthlyScores,
                    'current_avg' => $currentAvg,
                    'risk_count' => $riskCount,
                ]);

            if(!$response->successful()) {
                return response()->json(
                    ['error' => 'AI分析に失敗しました'],
                    502
                );
            }
            return response()->json($response->json());
        } catch (\Exception $e){
            return response()->json(
                ['error' => 'AI分析サーバーに接続できません'],
                503
            );

        }
    }
}
