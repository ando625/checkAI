<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Comment;
use App\Http\Requests\CommentRequest;

class CommentController extends Controller
{
    public function commentStore(CommentRequest $request, Report $report)
    {
        $comment = $report->comments()->create([
            'user_id' => $request->user()->id,
            'comment_body' => $request->comment_body,
        ]);

        $comment->load('user');

        return response()->json($comment,201);
    }

    public function commentDestroy(Request $request, Comment $comment)
    {
        // ログイン中のユーザーIDとコメントの投稿者IDが一致するか確認
        if($request->user()->id !== $comment->user_id){
            return response()->json(['message' => '削除権がありません'],403);
        }

        $comment->delete();

        return response()->json(null,204);
    }
}
