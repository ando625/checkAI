<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\ReportRequest;
use App\Models\Report;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    // 報告一覧
    public function index()
    {
        $reports = Report::with('user', 'comments.user')
            ->latest()
            ->paginate(10);


        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'total' => $reports->total(),
            ],
        ]);
    }


    //報告を投稿してPython AI サービスで分析
    public function reportStore(ReportRequest $request)
    {
        $analysis = $this->analyzeWithAI($request->content);

        $report = Report::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'status' => $analysis['status'],
            'score_total' => $analysis['score_total'],
            'score_positive' => $analysis['score_positive'],
            'score_negative' => $analysis['score_negative'],
            'ai_summary' => $analysis['ai_summary'],
        ]);

        $report->load('user'); //報告に投稿者の名前もつけて送る　idしかないから

        return response()->json($report,201);

    }


    /**
     * Python FastAPI (Gemini) に分析を依頼
     * 失敗した場合はフォールバック値を返す
     */
    private function analyzeWithAI(string $content): array{


        //AIがいる場所を確認
        $aiServiceUrl = config('services.ai.url', 'http://python:8000');

        //通信開始
        try{
            //AIに分析してほしいデータを送る
            $response = Http::timeout(30) //30秒待っても返事がなければ諦める
                //データを箱に入れて送る、中身はユーザーが書いた$content
                ->post("{$aiServiceUrl}/analyze",[
                    'content' => $content,
                ]);

                //AIから返事が来たらその結果をそのまま使う
                if($response->successful()){
                    return $response->json();
                }

                //失敗したらログを残す
                Log::warning('AI service returned error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
        } catch (\Exception $e){
            //AIの部屋がなかった　通信トラブルなど
            Log::error('AI service connection failed', [
                'error' => $e->getMessage(),
            ]);
        }

        //AIサービスが落ちていても報告投稿は成功させるフォールバック(仮のデータを返す)
        return [
            'status' => '要確認',
            'score_total' => 50,
            'score_positive' => 0,
            'score_negative' => 0,
            'ai_summary' => 'AI分析を現在利用できません。',
        ];

    }

    //報告削除
    public function reportDestroy(Request $request, Report $report)
    {
        //ログイン中のゆーざーIDと報告の投稿IDが一致するか確認
        if ($request->user()->id !== $report->user_id){
            return response()->json(['message' => '削除権限がありません'],403);
        }

        $report->delete();

        return response()->json(null,204);
    }
}
