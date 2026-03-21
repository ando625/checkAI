// 1件の報告を表示する部品

// ├ ヘッダー
// │   ├ アバター
// │   ├ 名前
// │   ├ 投稿日
// │   └ ステータスバッジ
// │
// ├ 日報本文
// │
// ├ スコアパネル
// │
// ├ AI要約（ボタンで開く）
// │
// └ コメント（開閉）

'use client';

import { useState } from 'react';
import { StatusBadge, ScorePanel,Avatar } from './ReportUI';
import { Sparkles, MessageSquare, ChevronDown, ChevronUp, Trash2, Send } from 'lucide-react';
import { Report, Comment, StoreCommentPayload } from '@/types/report';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';


// このコンポーネントが受け取るデータの型定義
interface ReportCardProps {
    report: Report;
    currentUserId: number;                                                          // ログイン中のユーザーID
    onDeleteReport: (reportId: number) => Promise<boolean>;                        // 報告削除関数
    onSubmitComment: (reportId: number, payload: StoreCommentPayload) => Promise<Comment | null>; // コメント投稿関数
    onDeleteComment: (commentId: number) => Promise<boolean>;                      // コメント削除関数
}

export function ReportCard({ report, currentUserId, onDeleteReport,onSubmitComment,onDeleteComment }: ReportCardProps) {

    //AI要約表示？　　コメント開閉
    const [showSummary, setShowSummary] = useState(false);
    const [commentOpen, setCommentOpen] = useState(false);

    const [comments, setComments] = useState<Comment[]>((report as any).comments ?? []);
    const [commentText, setCommentText] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    //自分の報告かどうか
    const isMyReport = currentUserId === report.user_id;

    //報告を削除する
    const handleDeleteReport = async () => {
        // window.confirm で「本当に消す？」と確認ダイアログを出す
        if (!window.confirm('この報告を削除しますか？')) return;
        await onDeleteReport(report.id);
    };

    //コメントを投稿する
    const handleSubmitComment = async () => {
        //空文字や空白だけなら送らない
        if (!commentText.trim()) return;

        setIsPosting(true);
        const newComment = await onSubmitComment(report.id, { comment_body: commentText });

        if (newComment) {
            //投稿成功したらコメント一覧の末尾に追加
            setComments((prev) => [...prev, newComment]);
            setCommentText('');
        }
        setIsPosting(false);
    }

    //コメントを削除する
    const handleDeleteComment = async (commentId: number) => {
        if (!window.confirm('コメントを削除しますか？')) return;
        const ok = await onDeleteComment(commentId);
        if (ok) {
            //削除成功したら画面上のコメント一覧からも取り除く
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 transition-shadow hover:shadow-sm">
            {/* アバター */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar name={report.user.name} userId={report.user_id} />
                    <div>
                        <p className="font-bold text-sm text-slate-800">
                            {report.user.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            {new Date(report.created_at).toLocaleString(
                                'ja-JP',
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <StatusBadge status={report.status} />
                    {isMyReport && (
                        <button
                            onClick={handleDeleteReport}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                            title="報告を削除"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* 日報本文 */}
            <p className="text-sm leading-relaxed text-slate-700">
                {report.content}
            </p>

            {/* スコアパネル Pythonから計算されて返ってきたスコアを表示*/}
            <ScorePanel
                total={report.score_total}
                positive={report.score_positive}
                negative={report.score_negative}
            />

            {/* AI要約セクション */}
            <div className="pt-2">
                <button
                    onClick={() => setShowSummary(!showSummary)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    AI要約を表示
                </button>
                {showSummary && (
                    <div className="mt-3 p-4 rounded-xl text-sm leading-relaxed bg-slate-50 text-slate-600 border-l-4 border-blue-400">
                        {report.ai_summary ?? 'AI要約を取得できませんでした'}
                    </div>
                )}
            </div>

            {/* コメントセクション */}
            <div>
                <button
                    onClick={() => setCommentOpen(!commentOpen)}
                    className="flex items-center justify-between w-full py-2 text-sm text-slate-400 hover:text-slate-600"
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>コメント ({comments.length})</span>
                    </div>
                    {commentOpen ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>

                {/* コメントが開いてる時だけ表示 */}
                {commentOpen && (
                    <div className="mt-3 space-y-3">
                        {/* コメント一覧 */}
                        {comments.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2">
                                コメントはまだありません
                            </p>
                        ) : (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="flex items-start gap-2 p-3 rounded-xl bg-slate-50"
                                >
                                    <Avatar
                                        name={comment.user.name}
                                        userId={comment.user_id}
                                        size={20}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-700">
                                                    {comment.user.name}
                                                </p>
                                                <span className="text-[10px] text-slate-400 ml-2">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            comment.created_at,
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                            locale: ja,
                                                            includeSeconds: true,
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            {/* 自分のコメントにだけ削除ボタンを表示 */}
                                            {currentUserId ===
                                                comment.user_id && (
                                                <button
                                                    onClick={() =>
                                                        handleDeleteComment(
                                                            comment.id,
                                                        )
                                                    }
                                                    className="text-slate-300 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {comment.comment_body}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* コメント入力フォーム */}
                        <div className="flex gap-2 pt-1">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSubmitComment()
                                }
                                placeholder="コメントを入力..."
                                className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button
                                className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40"
                                onClick={handleSubmitComment}
                                disabled={isPosting || !commentText.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}
