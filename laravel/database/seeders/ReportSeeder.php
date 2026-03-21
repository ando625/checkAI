<?php
// laravel/database/seeders/ReportSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        // UserSeederで作ったユーザーを全員取得
        $users = User::all();

        // ユーザーが0人なら何もしない（UserSeederを先に実行してください）
        if ($users->isEmpty()) {
            $this->command->warn('⚠️ ユーザーがいません。先にUserSeederを実行してください。');
            return;
        }

        // -------------------------
        // 報告書のサンプルテキスト（ステータスごとに複数用意）
        // -------------------------
        $contents = [
            '順調' => [
                ['content' => '本日はクライアントとの最終要件定義を確認しました。大きな変更はなく、当初のスケジュール通り来週から開発フェーズに移行できる見込みです。', 'score' => 90, 'p' => 55, 'n' => 5],
                ['content' => '新しい技術スタック（Next.js 14）の導入調査が完了しました。既存のコンポーネントをうまく共通化できる目処が立ちました。', 'score' => 88, 'p' => 52, 'n' => 2],
                ['content' => '週次の進捗報告会を実施。全タスクがオンスケジュールであることを確認しました。後半のテスト工程に時間を割くことができそうです。', 'score' => 92, 'p' => 58, 'n' => 4],
                ['content' => '今月のKPIとしていた新規リード獲得数を本日達成しました。チームの士気も非常に高く、次の目標に向けて準備を進めています。', 'score' => 95, 'p' => 60, 'n' => 0],
                ['content' => 'A社との商談が成立しました。先方の反応も良く、来週正式契約の予定です。チーム全体の士気も高く、目標達成に向けて順調です。', 'score' => 85, 'p' => 50, 'n' => 5],
                ['content' => 'プロジェクトのマイルストーンを予定通りクリアしました。チームの連携もスムーズで、特に問題はありません。', 'score' => 82, 'p' => 48, 'n' => 6],
            ],
            '要確認' => [
                ['content' => 'B社向けの資料作成が少し遅れています。明日の午前中には完了させますが、念のため共有しておきます。', 'score' => 55, 'p' => 20, 'n' => 30],
                ['content' => 'デザインチームからの納品物について、一部認識の相違がありました。再修正を依頼しています。', 'score' => 50, 'p' => 15, 'n' => 35],
                ['content' => '新機能リリース後、一部ユーザーから使いにくいというフィードバックが届いています。動向を注視しています。', 'score' => 60, 'p' => 25, 'n' => 25],
                ['content' => '今月の数字は目標の60%程度です。後半で挽回できるよう、重点顧客へのアプローチを強化する予定です。', 'score' => 58, 'p' => 22, 'n' => 28],
                ['content' => 'チーム内で役割分担について認識のズレがありました。話し合いで解決しましたが、今後はより明確に共有が必要です。', 'score' => 52, 'p' => 18, 'n' => 32],
            ],
            'リスクあり' => [
                ['content' => '本番環境のDBでスロークエリが発生し、一時的にレスポンスが低下しました。根本的なインデックスの再設計が必要です。', 'score' => 20, 'p' => 5, 'n' => 55],
                ['content' => 'メインの開発担当者が体調不良で離脱しました。代わりの人員が見当たらないため、今週の実装がストップしています。', 'score' => 25, 'p' => 5, 'n' => 50],
                ['content' => '顧客から提示された追加要件が、現在の構成では実現不可能と判明。コストと工数が大幅に膨らむリスクが出ています。', 'score' => 15, 'p' => 5, 'n' => 55],
            ],
        ];

        // -------------------------
        // 過去3ヶ月分を1日ずつループして報告書を生成
        // -------------------------
        $startDate = Carbon::now()->subMonths(3)->startOfDay();
        $endDate   = Carbon::now()->endOfDay();

        $currentDate = $startDate->copy();
        $totalCreated = 0;

        while ($currentDate->lte($endDate)) {

            // 土日は70%の確率でスキップ（週末は報告少なめ）
            if ($currentDate->isWeekend() && rand(1, 10) <= 7) {
                $currentDate->addDay();
                continue;
            }

            // 1日あたり1〜3件生成
            $reportCount = rand(1, 3);

            for ($i = 0; $i < $reportCount; $i++) {

                // ステータスを重み付きでランダムに決める
                // 順調:要確認:リスクあり = 5:3:2
                $rand = rand(1, 10);
                if ($rand <= 5) {
                    $status = '順調';
                } elseif ($rand <= 8) {
                    $status = '要確認';
                } else {
                    $status = 'リスクあり';
                }

                // そのステータスの報告からランダムに1件選ぶ
                $reportData = $contents[$status][array_rand($contents[$status])];

                // スコアに少しランダムなブレを加える（毎回同じにならないように）
                // max(0, min(上限, 値)) で範囲内に収める
                $scoreTotal    = max(0,  min(100, $reportData['score'] + rand(-5, 5)));
                $scorePositive = max(0,  min(60,  $reportData['p']     + rand(-3, 3)));
                $scoreNegative = max(0,  min(60,  $reportData['n']     + rand(-3, 3)));

                // その日の業務時間内（9時〜18時）のランダムな時刻
                $createdAt = $currentDate->copy()->setTime(
                    rand(9, 18),
                    rand(0, 59),
                    rand(0, 59)
                );

                Report::create([
                    'user_id'        => $users->random()->id, // 4人からランダム
                    'content'        => $reportData['content'],
                    'status'         => $status,
                    'score_total'    => $scoreTotal,
                    'score_positive' => $scorePositive,
                    'score_negative' => $scoreNegative,
                    'ai_summary'     => 'これはAIによる要約のダミーテキストです。',
                    'created_at'     => $createdAt,  // ★ 過去の日付をセット
                    'updated_at'     => $createdAt,
                ]);

                $totalCreated++;
            }

            $currentDate->addDay();
        }

        $this->command->info("✅ ReportSeeder完了：{$totalCreated}件の報告書を登録しました");
    }
}
