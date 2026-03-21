'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMypage } from '@/hooks/useMypage';
import { useReports } from '@/hooks/useReports';
import { ReportCard } from '@/components/ReportCard';
import { ProfileEditForm } from '@/components/ProfileEditForm';
import { Navbar } from '@/components/Navbar';
import { Pagination } from '@/components/Pagination';
import {User } from 'lucide-react';


export default function MyPage() {
    const { user } = useAuth({ middleware: 'auth' });

    // マイページ専用のデータ
    const {
        myReports,
        meta,
        isLoading,
        isUpdating,
        updateName,
        fetchMyReports,
    } = useMypage();

    // コメント機能はuseReportsから借りる
    const { submitComment, deleteComment, deleteReport } =
        useReports();

    

    // userがまだ読み込まれていない間は何も表示しない
    // （ダッシュボードと同じパターン）
    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                <div className="flex items-center gep-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="ml-2 text-2xl font-bold text-gray-800">
                                        マイページ
                                    </h3>
                                </div>

                {/* 名前変更フォーム */}
                <ProfileEditForm
                    currentName={user.name} // 今の名前を渡す
                    onUpdate={updateName} // 保存ボタンを押したときの関数
                    isUpdating={isUpdating} // 更新中かどうか
                />

                {/* 自分の報告一覧 */}
                <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-800">
                        自分の報告一覧
                    </h3>

                    {isLoading ? (
                        <p className="text-sm text-slate-400">読み込み中...</p>
                    ) : myReports.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            まだ報告はありません
                        </p>
                    ) : (
                        myReports.map((report) => (
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
                    {/* ページネーション */}
                    {meta && (
                        <Pagination
                            currentPage={meta.current_page}
                            lastPage={meta.last_page}
                            total={meta.total}
                            onPageChange={(page) => fetchMyReports(page)}
                        // ↑ fetchReports ではなく fetchMyReports を使う
                        />)}
                </div>
            </main>
        </div>
    );
}
