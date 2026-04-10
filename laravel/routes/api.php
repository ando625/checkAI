<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ManualChatController;
use App\Http\Controllers\MypageController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use Whoops\Run;


Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function (){

    //ホーム表示　一覧表示
    Route::get('/reports', [ReportController::class, 'index']);

    // 報告作成
    Route::post('/reports', [ReportController::class, 'reportStore']);

    //報告投稿を削除
    Route::delete('/reports/{report}', [ReportController::class, 'reportDestroy']);

    //コメント作成
    Route::post('/reports/{report}/comments', [CommentController::class, 'commentStore']);

    //コメント削除
    Route::delete('/comments/{comment}', [CommentController::class, 'commentDestroy']);

    //マイページ一覧表示
    Route::get('/mypage', [MypageController::class, 'index']);

    //マイページ編集
    Route::put('/mypage', [MypageController::class, 'update']);

    //分析データ：平均スコア・総報告数・ポジティブ率・リスク報告数
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);

    //分析データ：週間スコア推移グラフ用データ
    Route::get('/analytics/weekly', [AnalyticsController::class, 'weekly']);

    //分析データ：月別平均スコアグラフ用データ
    Route::get('/analytics/monthly', [AnalyticsController::class, 'monthly']);

    //分析データ：円グラフと横棒グラフ
    Route::get('/analytics/status', [AnalyticsController::class, 'status']);

    Route::get('/analytics/ai-insights', [AnalyticsController::class, 'aiInsights']);

    // 通知：未読件数
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

    // 通知：一覧取得
    Route::get('/notifications', [NotificationController::class, 'index']);

    // 通知：１件既読にする
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    //マニュアル質問ルート
    Route::post('/ask-manual', [ManualChatController::class, 'ask']);



});