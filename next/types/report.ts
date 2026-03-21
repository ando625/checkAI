
export type ReportStatus = '順調' | 'リスクあり' | '要確認';

//報告データのユーザ誰か
export interface ReportUser {
    id: number;
    name: string;
    email: string;
}

// 報告データ型
export interface Report {
    id: number;
    user_id: number;
    user: ReportUser;
    content: string;
    status: ReportStatus;
    score_total: number;
    score_positive: number;
    score_negative: number;
    ai_summary: string | null;
    comment_count: number;
    created_at: string;
    updated_at: string;
}

//ページネーション
export interface ReportPaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
}

//報告一覧APIのレスポンス型
export interface ReportIndexResponse{
    data: Report[];
    meta: ReportPaginationMeta;
}

//報告作成APIの送信データ型
export interface StoreReportPayload{
    content: string;
}

//コメントの投稿者
export interface CommentUser {
    id: number;
    name: string;
}

//コメント１件の型
export interface Comment {
    id: number;
    report_id: number;
    user_id: number;
    user: CommentUser;
    comment_body: string;
    created_at: string;
}

//コメント投稿APIに送るデータの型
export interface StoreCommentPayload {
    comment_body: string;
}