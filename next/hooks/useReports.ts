//業務報告APIを扱うカスタムHookの型定義
//報告一覧＋投稿処理をまとめる設計

import { useState, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';
import type { Report, ReportIndexResponse, StoreReportPayload, Comment, StoreCommentPayload } from '@/types/report';

interface UseReportsReturn {
    reports: Report[];
    meta: ReportIndexResponse['meta'] | null;
    isLoading: boolean; //テータ取得中かどうか
    isSubmitting: boolean; //投稿中かどうか
    error: string | null; //エラーメッセージ
    fetchReports: (page?: number) => Promise<void>; //報告一覧取得関数
    submitReport: (platload: StoreReportPayload) => Promise<Report | null>; //報告投稿関数
    submitComment: (
        reportId: number,
        payload: StoreCommentPayload,
    ) => Promise<Comment | null>; //コメント投稿
    deleteComment: (commentId: number) => Promise<boolean>; //コメント削除
    deleteReport: (reportId: number) => Promise<boolean>; //報告削除
}

//APIから報告を取得する処理
export function useReports(): UseReportsReturn{
    const [reports, setReports] = useState<Report[]>([]);  //報告一覧の状態
    const [meta, setMeta] = useState<ReportIndexResponse['meta'] | null>(null);  //ページネーション情報
    const [isLoading, setIsLoading] = useState(true);  //データ取得中がどうか
    const [isSubmitting, setIsSubmitting] = useState(false);  //投稿中かどうか
    const [error, setError] = useState<string | null>(null);  //エラーメッセージ

    //報告一覧を取得する関数
    const fetchReports = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await axios.get<ReportIndexResponse>(
                '/api/reports',
                {
                    params: { page },
                },
            );
            // fetchReports の中、setReports の直前に追加
            const reportsWithCount = data.data.map((r) => ({
                ...r,
                comment_count: r.comment_count ?? 0, // なければ0にする
            }));
            setReports(reportsWithCount);
            setMeta(data.meta)

        } catch (err: unknown) {
            setError('報告の取得に失敗しました');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);


    // 投稿処理の関数
    const submitReport = useCallback(async (payload: StoreReportPayload): Promise<Report | null> => {
        setIsSubmitting(true);
        setError(null);

        try {
            const { data } = await axios.post<Report>('/api/reports', payload);
            //投稿成功したら先頭に追加（再fetchより軽量)
            setReports((prev) => [data, ...prev]);
            return data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data?.errors) {
                const messages = Object.values(err.response.data.errors as Record<string, string[]>)
                    .flat()
                    .join(' ');
                setError(messages);
            } else {
                setError('投稿に失敗しました');
            }
            console.error(err);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }, []);


    //初回データ取得
    useEffect(() => {
        fetchReports();
    }, [fetchReports]);


    //コメントを投稿する関数
    const submitComment = useCallback(
        async (reportId: number, payload: StoreCommentPayload): Promise<Comment | null> => {
            try {
                // POST /api/reports/{reportId}/comments にデータを送る
                const { data } = await axios.post<Comment>(
                    `/api/reports/${reportId}/comments`,
                    payload,
                );
                return data; //作成されたコメントを返す
            } catch (err) {
                console.error(err);
                return null;
            }
        }, [],
    );

    //コメントを削除する関数
    const deleteComment = useCallback(
        async (commentId: number): Promise<boolean> => {
            try {
                // DELETE /api/comments/{commentId} を送る
                await axios.delete(`/api/comments/${commentId}`);
                return true;
            } catch (err) {
                console.error(err);
                return false;
            }
        }, [],
    );

    //報告を削除する関数
    const deleteReport = useCallback(
        async (reportId: number): Promise<boolean> => {
            try {
                await axios.delete(`/api/reports/${reportId}`);
                //削除成功したら画面上の一覧からも取り除く
                setReports((prev) => prev.filter((r) => r.id !== reportId));
                return true;
            } catch (err) {
                console.error(err);
                return false;
            }
        }, [],
    );


    return {
        reports,
        meta,
        isLoading,
        isSubmitting,
        error,
        fetchReports,
        submitReport,
        submitComment,
        deleteComment,
        deleteReport,
    };

}
