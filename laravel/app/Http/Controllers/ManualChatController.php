<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ManualChatController extends Controller
{
    /**
     * AIにマニュアルについて質問する
     */
    public function ask(Request $request)
    {
        //ユーザーからの質問を受けとる
        $question = $request->input('content');

        // PythonのAIサーバー（FastAPI）に質問を投げる
        $response = Http::post('http://python:8000/ask-manual', [
            'content' => $question
        ]);

        return response()->json($response->json());


    }
}
