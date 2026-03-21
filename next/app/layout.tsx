import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';

// 日本語フォントの設定
const notoSansJp = Noto_Sans_JP({
    subsets: ['latin'],
    variable: '--font-noto-sans-jp',
});

export const metadata: Metadata = {
    title: 'CheckPoint AI  | AI報告管理システム',
    description: 'AIによる文章分析と要約で、業務報告をスマートに管理します。',
};



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className={`${notoSansJp.variable} font-sans antialiased overflow-x-hidden`}>

                {children}

            </body>
        </html>
    );
}
