//ログインページの器

import LoginForm from '@/components/LoginForm';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function LoginPage() {
    return (
        <div>
            <header className="flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <FileText className="text-white w-6 h-6" />
                    </div>
                    <Link href="/">
                        <span className="text-xl font-bold tracking-tight text-slate-800">
                            CheckPoint AI
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
                    >
                        ログイン
                    </Link>
                    <Link
                        href="/register"
                        className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-full hover:bg-slate-800 transition shadow-md"
                    >
                        新規会員登録
                    </Link>
                </div>
            </header>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 font-sans">
                {/* ロゴ */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                        <FileText className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                        報告管理システム
                    </h1>
                </div>

                {/* カード部分 */}
                <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 p-10 border border-slate-100">
                    <div className="mb-8">
                        <h2 className="text-center text-xl font-bold text-slate-800">
                            ログイン
                        </h2>
                    </div>

                    <LoginForm />

                    <div className="mt-8 text-center">
                        <Link
                            href="/register"
                            className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                            新規登録はこちら
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
