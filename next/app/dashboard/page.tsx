'use client';

// ダッシュボードページ（親コンポーネント）
//
// このファイルの役割：
// ├ データの取得（useAuth・useReports）
// ├ 子コンポーネントへのデータ受け渡し
// └ 全体のレイアウト組み立て
//
// データの流れ：
//   useReports（フック）
//     → reports（一覧データ）
//     → submitReport（投稿関数）
//     → isLoading / isSubmitting / error（状態）
//   ↓ propsとして子へ渡す
//   PostForm / ReportCard / DashboardSkeleton

import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import { PostForm } from '@/components/PostForm';
import { ReportCard } from '@/components/ReportCard';
import { Navbar } from '@/components/Navbar';
import { Pagination } from '@/components/Pagination';
import { LayoutDashboard } from 'lucide-react';


export default function DashboardPage() {
    //認証情報の取得
    //middleware:'auth'-> 未ログインなら自動で/loginにリダイレクト
    const { user } = useAuth({ middleware: 'auth' });

    //報告データの取得・投稿
    const {
        reports, // 報告の配列
        meta,
        isLoading, // 最初の読み込み中かどうか
        isSubmitting, // 投稿処理中かどうか
        error, // エラーメッセージ（nullなら正常）
        submitReport, // 投稿関数
        submitComment,
        deleteComment,
        deleteReport,
        fetchReports,
    } = useReports();

    //投稿フォームから呼ばれる関数
    //PostFormに渡して「投稿ボタンが押されたら呼ぶ」関数として使う
    const handleSubmit = async (content: string): Promise<boolean> => {
        const result = await submitReport({ content }); //APIに投稿
        return result !== null; //成功したらtrue、失敗したらfalse
    };

    // ユーザー情報がまだ読み込まれていない間は何も表示しない
    // （useAuthのリダイレクト処理が走る前に画面がチラつくのを防ぐ）
    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8 overflow-x-hidden">
                {/* ページタイトル */}
                <div>
                    <div className='flex items-center gep-2'>
                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="ml-2 text-2xl font-bold text-slate-900">
                            ホーム
                        </h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        業務報告の投稿と確認ができます
                    </p>
                </div>
                <>
                    {/* 投稿フォーム */}
                    <PostForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        error={error}
                    />
                    {/* 報告一覧 */}
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-slate-800">
                            報告一覧
                        </h2>

                        {/* 報告が0件の時 */}
                        {reports.length === 0 ? (
                            <div className="text-center py-16 text-sm text-slate-400">
                                まだ報告はありません。最初の報告を投稿してみましょう！
                            </div>
                        ) : (
                            reports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    currentUserId={user.id}
                                    onDeleteReport={deleteReport}
                                    onSubmitComment={submitComment}
                                    onDeleteComment={deleteComment}
                                />
                            ))
                        )}

                        {/* ページネーションボタン */}
                        {meta && (
                            <Pagination
                                currentPage={meta.current_page}
                                lastPage={meta.last_page}
                                total={meta.total}
                                onPageChange={(page) => fetchReports(page)}
                            />
                        )}
                    </div>
                </>
            </main>
        </div>
    );
}
