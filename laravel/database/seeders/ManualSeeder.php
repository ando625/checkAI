<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ManualSeeder extends Seeder
{
    /**
     * 社内マニュアルをPythonのデータフォルダに書き出す
     */
    public function run(): void
    {
        // 1. 書き出し先のパス（Docker環境の相対パス）
        // Laravelのルートから見て、隣にある python/data フォルダを指します
        $path = base_path('../python/data/manual.txt');

        // 2. マニュアルの内容（ヒアドキュメントで読みやすく作成）
        $content = <<<EOL
【CheckPoint AI 株式会社 業務マニュアル】

1. 有給休暇について
・入社から6ヶ月経過後に、初年度10日の有給休暇が付与されます。
・申請は、休暇取得希望日の「3日前」までに、上長へのシステム報告を通じて行ってください。

2. 業務報告のルール
・毎日の業務報告は、退勤時間の15分前までに投稿してください。
・トラブルが発生した場合は「リスクあり」として即座に報告し、コメント欄で指示を仰いでください。
EOL;

        // 3. フォルダが存在しない場合は作成する
        $directory = dirname($path);
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        // 4. ファイルを書き込む
        File::put($path, $content);

        $this->command->info('社内マニュアルを python/data/manual.txt に作成しました！');
    }
}
