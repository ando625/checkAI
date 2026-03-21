
import { useState, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';
import type { Report, ReportIndexResponse } from '@/types/report';

interface UseMypageReturn {
    myReports: Report[]; //自分の報告一覧
    meta: ReportIndexResponse['meta'] | null;
    isLoading: boolean; //読み込み中かどうか
    isUpdating: boolean; //名前更新中かどうか
    updateName: (name: string) => Promise<boolean>; //名前を更新する関数
    fetchMyReports: (page?: number) => Promise<void>;
}

export function useMypage(): UseMypageReturn{

    //自分の報告を入れる箱
    const [myReports, setMyReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [meta, setMeta] = useState<ReportIndexResponse['meta'] | null>(null);

    //名前を更新中かどうか
    const [isUpdating, setIsUpdating] = useState(false);

    //自分の報告一覧を取得する
    const fetchMyReports = useCallback(async (page = 1) => {

        setIsLoading(true);
        try {
            const { data } = await axios.get<ReportIndexResponse>('/api/mypage',{params:{page}},);
            setMyReports(data.data);
            setMeta(data.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    //名前を更新する関数
    const updateName = useCallback(async (name: string): Promise<boolean> => {
        setIsUpdating(true);
        try {
            await axios.put('/api/mypage', { name });
            return true;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, []);

    //ページを開いたときに１回だけ報告一覧を取得
    useEffect(() => {
        fetchMyReports();
    }, [fetchMyReports]);

    return {
        myReports,
        meta,
        isLoading,
        isUpdating,
        updateName,
        fetchMyReports,
    };

}