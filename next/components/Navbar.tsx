'use client';

import { useState, useEffect, useRef } from 'react'; // 追加
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
    MessageSquareText,
} from 'lucide-react'; // Menu, X を追加
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from '@/lib/axios';

//通知一件の型定義
type Notification = {
    id: number;
    report_id: number;
    is_read: boolean;
    created_at: string;
    comment: {
        comment_body: string;
        user: {
            name: string;
        };
    };
};

export function Navbar() {
    const { user, logout } = useAuth({ middleware: 'auth' });
    const pathname = usePathname();
    const router = useRouter();

    // スマホ用メニューの開閉状態
    const [isOpen, setIsOpen] = useState(false);

    //通知関連のstatus
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    //ドロップダウンの外をクリックたらとじる
    const notifRef = useRef<HTMLDivElement>(null);

    //未読件数を定期的に取得する（3０秒ごと）
    useEffect(() => {
        if (!user) return;

        const fetchUnreadCount = async () => {
            const res = await axios.get('/api/notifications/unread-count'); // fetchからaxiosに変更
            setUnreadCount(res.data.count);
        };

        fetchUnreadCount();
        const timer = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(timer);
    }, [user]);

    //ドロップダウンの外をクリックしたら閉じる
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                notifRef.current &&
                !notifRef.current.contains(e.target as Node)
            ) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    //ベルアイコンをクリックした時通知一覧を取得してドロップダウンを開く
    const handleBellClick = async () => {
        const res = await axios.get('/api/notifications'); // fetchからaxiosに変更
        console.log('通知データ:', res.data);
        console.log('isNotifOpen:', !isNotifOpen);  
        setNotifications(res.data); // axiosはres.dataでデータが取れる
        setIsNotifOpen((prev) => !prev);
    };


    // 通知をクリックしたとき：既読にして報告書ページに飛ぶ
    const handleNotifClick = async (notif: Notification) => {
        await axios.put(`/api/notifications/${notif.id}/read`); // fetchからaxiosに変更

        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? {...n, is_read:true} : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setIsNotifOpen(false);
        window.location.href = `/dashboard?report_id=${notif.report_id}`;
    };

    const navItems = [
        { href: '/dashboard', label: 'ホーム', icon: LayoutDashboard },
        { href: '/analytics', label: '分析データ', icon: BarChart2 },
        { href: '/chat', label: 'AIチャット', icon: MessageSquareText },
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
                    {/* AIチャットへのクイックアクセスボタン */}
                    <Link
                        href="/chat"
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-xs font-bold border border-blue-100"
                    >
                        <MessageSquareText className="w-3.5 h-3.5" />
                        AIに相談
                    </Link>

                    {/* ベルアイコン＋ドロップダウン */}
                    <div className="relative" ref={notifRef}>
                        <button
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative"
                            onClick={handleBellClick}
                        >
                            <Bell className="w-5 h-5" />
                            {/* 未読バッジ：右上に配置 */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* 通知ドロップダウン */}
                        {isNotifOpen && (
                            <div className="absolute -right-16 md:right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                                <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-700">
                                    通知
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-slate-400 text-sm">
                                        通知はありません
                                    </div>
                                ) : (
                                    <ul>
                                        {notifications.map((notif) => (
                                            <li
                                                key={notif.id}
                                                onClick={() =>
                                                    handleNotifClick(notif)
                                                }
                                                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-0 ${
                                                    !notif.is_read
                                                        ? 'bg-blue-50'
                                                        : ''
                                                }`}
                                            >
                                                <p className="text-sm text-slate-700">
                                                    <span className="font-semibold">
                                                        {
                                                            notif.comment.user
                                                                .name
                                                        }
                                                    </span>
                                                    さんがコメントしました
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                    {notif.comment.comment_body}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

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
