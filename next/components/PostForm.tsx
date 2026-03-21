'use client';

// 投稿フォーム
// ├ タイトル行（＋アイコン + ラベル）
// ├ テキストエリア
// ├ エラーメッセージ（バリデーション失敗時）
// ├ 説明文
// └ 投稿ボタン（空欄・送信中は非活性）

import { useState } from 'react';
import { Send, PlusCircle } from 'lucide-react';

interface PostFormProps{
    onSubmit: (content: string) => Promise<boolean>;
    isSubmitting: boolean;
    error: string | null;
}

export function PostForm({ onSubmit, isSubmitting, error }: PostFormProps) {
    //テキストエリア入力内容を管理
    const [content, setContent] = useState('');

    const handleSubmit = async () => {
        if (!content.trim()) return; //空欄なら何もしない

        //親から受け取ったonSubmit(content)関数を呼ぶ
        const success = await onSubmit(content);
        if (success) setContent(''); // 投稿成功したらテキストエリアを空にする
    };

    // 送信できない条件：空欄 または 送信中
    const cannotSubmit = !content.trim() || isSubmitting;


    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            {/* タイトル行 */}
            <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-800">
                    新規報告を投稿
                </span>
            </div>

            {/* テキストエリア */}
            <div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="今日の業務報告を入力してください"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:bg-white transition-colors"
                    style={{ minHeight: 88 }}
                ></textarea>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            {/* 下段：説明 + ボタン */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                    投稿後、AIが自動で文章を分析します
                </p>
                <button
                    onClick={handleSubmit}
                    disabled={cannotSubmit}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-slate-900 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                    {/* 送信中かどうかでボタンのテキストを切り替え */}
                    {isSubmitting ? '投稿中...' : '投稿する'}
                </button>
            </div>
        </div>
    );
}