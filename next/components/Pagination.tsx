//ページネーションのコンポーネント

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, total, onPageChange }: PaginationProps) {


    return (
        <div className="flex items-center justify-center py-4 gap-2">
            {/* 件数表示 */}
            <p className="text-slate-500 font-bold mr-4">全{total}件</p>

            {/* ページボタン */}
            <div className="flex items-center gap-2">
                {/* 前へボタン */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-slate-400 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    前へ
                </button>

                {/* 今何ページか表示 */}
                <span className=" text-slate-600">
                    {currentPage} / {lastPage}
                </span>

                {/* 次へのボタン */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="px-3 py-1 rounded-lg border border-slate-400 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    次へ
                </button>
            </div>
        </div>
    );
}