'use client';

//新規登録フォームの部品ファイル

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';;
import type { RegisterInput } from '@/types/auth';;

export default function RegisterForm() {
    const { register, errors, isLoading } = useAuth();

    const [input, setInput] = useState<RegisterInput>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register(input);
    };

    // 共通の入力スタイル
    const inputStyle =
        'w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none';
    //共通ラベルスタイル
    const labelStyle = 'block text-sm font-semibold text-slate-700 mb-2';

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className={labelStyle}>名前</label>
                <input
                    type="text"
                    name="name"
                    placeholder="テスト太郎"
                    value={input.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={inputStyle}
                />
                {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name[0]}</p>
                )}
            </div>

            <div>
                <label className={labelStyle}>メールアドレス</label>
                <input
                    type="email"
                    name="email"
                    placeholder="test@example.com"
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
                    value={input.password}
                    onChange={handleChange}
                    placeholder="●●●●●●●●"
                    disabled={isLoading}
                    className={inputStyle}
                />
                {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password[0]}</p>
                )}
            </div>

            <div>
                <label className={labelStyle}>パスワード確認</label>
                <input
                    type="password"
                    name="password_confirmation"
                    value={input.password_confirmation}
                    onChange={handleChange}
                    placeholder="●●●●●●●●"
                    disabled={isLoading}
                    className={inputStyle}
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
                >
                    {isLoading ? '送信中...' : '新規登録'}
                </button>
            </div>
        </form>
    );
}