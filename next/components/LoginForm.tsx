'use client';

// ログインフォームの部品ファイル

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginInput } from '@/types/auth';

export default function LoginForm() {
    //useAuthから必要なものだけ取り出す
    const { login, errors, isLoading } = useAuth();

    //フォーム入力をまとめて管理
    const [input, setInput] = useState<LoginInput>({
        email: '',
        password: '',
        remember: false,
    });

    //入力値が変わったときに呼ばれる関数
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //変更されたinputのname.value.type.checkedを取り出す
        const { name, value, type, checked } = e.target;
        setInput((prev) => ({
            ...prev, //今の値を全部コピーして変更されたところのみ上書き
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    //フォームが送信されたときに呼ばれる関数
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        //useAuthのlogin関数に入力値を渡して実行
        await login(input);
    };

    // 共通の入力スタイル
    const inputStyle = "w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none";
    //共通ラベルスタイル
    const labelStyle = "block text-sm font-semibold text-slate-700 mb-2";

    return (
        <form onSubmit={handleSubmit} className="space-y-7">
            <div>
                <label className={labelStyle}>メールアドレス</label>
                <input
                    type="email"
                    name="email"
                    placeholder="text@example.com"
                    value={input.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={inputStyle}
                />
                {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email[0]}</p>
                )}
            </div>

            <div>
                <label className={labelStyle}>パスワード</label>
                <input
                    type="password"
                    name="password"
                    placeholder="●●●●●●●●"
                    value={input.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={inputStyle}
                />
                {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password[0]}</p>
                )}
            </div>

            <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        name="remember"
                        checked={input.remember}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        ログイン状態を維持する
                    </span>
                </label>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
                >
                    {isLoading ? '送信中...' : 'ログイン'}
                </button>
            </div>
        </form>
    );
}
