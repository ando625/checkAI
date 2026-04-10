'use client'

import { useState } from "react"
import axios from '@/lib/axios';
import { MessageSquareText, Send, Bot, User, Loader2 } from 'lucide-react';
import { Navbar } from "@/components/Navbar";

//チャット履歴を保存するための型
type Message = {
    role: 'user' | 'ai';
    content: string;
};

export default function ChatPage() {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isLoading) return;

        // 1. ユーザーのメッセージを画面に追加
        const userMsg: Message = { role: 'user', content: question };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion('');
        setIsLoading(true);

        try {
            // 2. LaravelのAPIを叩く
            const res = await axios.post('/api/ask-manual', {
                content: question,
            });

            // 3. AIの回答を画面に追加
            const aiMsg: Message = { role: 'ai', content: res.data.answer };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error('AI送信エラー:', error);
            const errorMsg: Message = {
                role: 'ai',
                content:
                    'エラーが発生しました。時間を置いて再度お試しください。',
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* ヘッダー部分 */}
                <div className="flex items-center gap-3 mb-8 border-b pb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <MessageSquareText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            社内マニュアル AI相談室
                        </h1>
                        <p className="text-sm text-slate-500">
                            マニュアルの内容についてAIが回答します
                        </p>
                    </div>
                </div>

                {/* チャット履歴表示エリア */}
                <div className="space-y-6 mb-24 min-h-[400px]">
                    {messages.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">
                                「有給は何日前までに申請？」など
                                <br />
                                何でも聞いてくださいね！
                            </p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    msg.role === 'user'
                                        ? 'bg-slate-200'
                                        : 'bg-blue-100 text-blue-600'
                                }`}
                            >
                                {msg.role === 'user' ? (
                                    <User className="w-5 h-5" />
                                ) : (
                                    <Bot className="w-5 h-5" />
                                )}
                            </div>
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-200 shadow-sm rounded-tl-none text-slate-700'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none">
                                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>

                {/* 入力フォーム（下部に固定） */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
                    <form
                        onSubmit={handleSend}
                        className="max-w-3xl mx-auto relative"
                    >
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="質問を入力してください..."
                            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}