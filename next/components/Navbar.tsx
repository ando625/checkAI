'use client';

import { useState } from 'react'; // 追加
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from './ReportUI';
import {
    LayoutDashboard,
    BarChart2,
    User,
    Bell,
    LogOut,
    Menu,
    X,
} from 'lucide-react'; // Menu, X を追加
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const { user, logout } = useAuth({ middleware: 'auth' });
    const pathname = usePathname();

    // スマホ用メニューの開閉状態
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { href: '/dashboard', label: 'ホーム', icon: LayoutDashboard },
        { href: '/analytics', label: '分析データ', icon: BarChart2 },
        { href: '/mypage', label: 'マイページ', icon: User },
    ];

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-full px-4 md:px-10 h-16 flex items-center justify-between">
                {/* ロゴエリア */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-slate-800 truncate">
                        CheckPoint AI
                    </span>
                </div>

                {/* PC用ナビリンク (md:以上で表示) */}
                <div className="hidden md:flex items-center gap-3">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-slate-100 text-slate-900 font-medium'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* 右側エリア */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                        <Bell className="w-5 h-5" />
                    </button>

                    {/* PC用ユーザー情報 (md:以上で表示) */}
                    {user && (
                        <div className="hidden md:flex items-center gap-3">
                            <Avatar
                                name={user.name}
                                userId={user.id}
                                size={30}
                            />
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
                            >
                                <LogOut className="w-3 h-3" />
                                ログアウト
                            </button>
                        </div>
                    )}

                    {/* スマホ用メニューボタン (md:未満で表示) */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* スマホ用ドロップダウンメニュー */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-lg">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setIsOpen(false)} // クリックしたら閉じる
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                                pathname === href
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-600'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    ))}
                    {user && (
                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3 px-3 mb-4">
                                <Avatar
                                    name={user.name}
                                    userId={user.id}
                                    size={32}
                                />
                                <span className="font-medium text-slate-700">
                                    {user.name}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                                <LogOut className="w-5 h-5" />
                                ログアウト
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
