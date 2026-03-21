'use client';

import { useState } from "react";

//このコンポーネントが受け取るデータの型
export interface ProfileEditFormProps {
    currentName: string;
    onUpdate: (name: string) => Promise<boolean>;
    isUpdating: boolean;
}

export function ProfileEditForm({ currentName, onUpdate, isUpdating }: ProfileEditFormProps) {
    
    //入力欄の値を管理する箱（最初は今の名前を入れる）
    const [name, setName] = useState(currentName);

    const [message, setMessage] = useState('');

    //保存ボタンを押した時
    const handleSubmit = async () => {
        if (!name.trim()) return;

        const ok = await onUpdate(name);  //親から受け取った関数を呼ぶ

        if (ok) {
            setMessage('名前を更新しました！');
        } else {
            setMessage('更新に失敗しました');
        }
    };


    return (
        <div className=" bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div >
                <h3 className="font-bold text-slate-800">プロフィール編集</h3>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-slate-600">名前</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            {message && (
                <p className="text-sm text-green-600">{message}</p>
            )}
            
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-40"
                >
                    {isUpdating ? '更新中...' : '更新する'}
                </button>
            </div>
        </div>
    );
}