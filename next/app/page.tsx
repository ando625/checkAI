import Image from 'next/image';
import Link from 'next/link';
// Lucideから必要なアイコンをインポート
import {
    FileText,
    BarChart3,
    MessageSquare,
    ShieldCheck,
} from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* --- 1. ヘッダー --- */}
            <header className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <FileText className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-800">
                        CheckPoint AI
                    </span>
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

            <main>
                {/* --- 2. ヒーローセクション --- */}
                <section className="max-w-7xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-10">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900">
                                AIで業務報告を
                                <span className="text-blue-600">
                                    スマートに管理
                                </span>
                            </h1>
                            <p className=" text-slate-500 leading-relaxed max-w-lg">
                                文章のAI分析、自動要約、リアルタイム通知で、
                                <br />
                                チームのコミュニケーションを効率化します。
                            </p>
                        </div>
                        <div className="flex gap-5">
                            <Link
                                href="/register"
                                className="group flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-blue-200"
                            >
                                新規登録
                            </Link>
                            <Link
                                href="/login"
                                className="px-8 py-4 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-200 transition text-slate-700"
                            >
                                ログイン
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        {/* デザイン画像にあった、角の丸い大きな画像エリア */}
                        <div className="relative w-full aspect-[1.4/1] border border-slate-100 overflow-hidden">
                            <Image
                                src="/19729.jpg"
                                alt="Team meeting"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </section>

                {/* --- 3. 主な機能セクション --- */}
                <section className="bg-slate-50/50 py-28 px-8 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-4xl font-bold text-slate-900">
                                主な機能
                            </h2>
                            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            <FeatureCard
                                icon={
                                    <FileText className="w-8 h-8 text-blue-600" />
                                }
                                bgColor="bg-blue-50"
                                title="AI文章判定"
                                desc="報告内容を自動で分析し、ポジティブ・ネガティブを数値化します。"
                            />
                            <FeatureCard
                                icon={
                                    <BarChart3 className="w-8 h-8 text-emerald-600" />
                                }
                                bgColor="bg-emerald-50"
                                title="分析データ表示"
                                desc="AIの判定結果をグラフで可視化し、傾向を把握できます。"
                            />
                            <FeatureCard
                                icon={
                                    <MessageSquare className="w-8 h-8 text-purple-600" />
                                }
                                bgColor="bg-purple-50"
                                title="コメント機能"
                                desc="報告に対してコメントを追加し、チーム内でコミュニケーションできます。"
                            />
                            <FeatureCard
                                icon={
                                    <ShieldCheck className="w-8 h-8 text-orange-600" />
                                }
                                bgColor="bg-orange-50"
                                title="セキュアな認証"
                                desc="安全なログイン機能で、あなたのデータを保護します。"
                            />
                        </div>
                    </div>
                </section>
            </main>

            {/* --- 4. フッター（AI免責事項） --- */}
            <footer className="py-12 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-400">
                    &copy; 2026 報告管理システム. All rights reserved.{' '}
                    <br className="sm:hidden" />
                    <span className="inline-block mt-2 sm:mt-0 sm:ml-4 text-[10px] uppercase tracking-widest bg-slate-100 px-2 py-1 rounded text-slate-500">
                        AIの解析結果は正確性を保証するものではありません
                    </span>
                </p>
                <div className="max-w-screen-md mx-auto text-center text-xs text-zinc-500 leading-relaxed mt-2">
                    <p className="text-[10px] sm:text-xs leading-tight">
                        このサイトで使用している画像素材は{' '}
                        <a
                            href="https://jp.freepik.com/"
                            target="_blank"
                            rel="noopener"
                            className="text-indigo-600 hover:underline"
                        >
                            Freepik
                        </a>{' '}
                        提供のものです。
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-400 mt-1 opacity-80">
                        Images used in this site are from{' '}
                        <a
                            href="https://jp.freepik.com/"
                            target="_blank"
                            rel="noopener"
                            className="text-indigo-600 hover:underline"
                        >
                            Freepik
                        </a>
                        .
                    </p>
                </div>
            </footer>
        </div>
    );
}

// 機能カード用のコンポーネント
function FeatureCard({
    icon,
    bgColor,
    title,
    desc,
}: {
    icon: React.ReactNode;
    bgColor: string;
    title: string;
    desc: string;
}) {
    return (
        <div className="group flex flex-col items-center text-center space-y-6 p-8 rounded-3xl transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
            <div
                className={`w-20 h-20 ${bgColor} rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}
            >
                {icon}
            </div>
            <div className="space-y-3">
                <h3 className="font-bold text-xl text-slate-800">{title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
            </div>
        </div>
    );
}
