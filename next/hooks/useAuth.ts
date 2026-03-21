// 認証に関する処理を全部まとめた司令塔ファイル

// LoginForm.tsx  ──→  useAuth.ts  ──→  Laravel API
// RegisterForm.tsx        ↑
// dashboard/page.tsx  ────┘
// どのページからでも useAuth() を呼ぶだけでログイン・ログアウト・ユーザー情報が使えるようになる


import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import type { User, LoginInput, RegisterInput, ValidationErrors } from '@/types/auth';

export const useAuth = (config: { middleware?: 'auth' | 'guest'} = {}) => {
    const router = useRouter()

    //ログイン中のユーザー情報を管理する箱
    const [user, setUser] = useState<User | null>(null)
    //通信中かどうか管理
    const [isLoading, setIsLoading] = useState(true)
    //エラーメッセージを管理
    const [errors, setErrors] = useState<ValidationErrors>({})
    
    //ログイン中のユーザー情報取得
    const getUser = async () => {
        try {
            //laravelのAPIにユーザー情報をリクエスト、取得できたらuserに保存
            const { data } = await axios.get('/api/user')
            setUser(data)
        } catch {
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }


    //新規登録の関数
    const register = async (input: RegisterInput) => {
        setErrors({})
        try {
            await axios.get('/sanctum/csrf-cookie') //まずcsrfトークンを取得（laravelのセキュリティの決まり）
            await axios.post('/register', input) //登録データをlaravelに送る
            await getUser() //登録成功したらユーザー情報を取得
            router.push('/dashboard') //ダッシュボードに移動
        } catch (error: any) {
            if (error.response?.status === 422) {
                // エラーメッセージを保存して画面に表示できるようにする
                setErrors(error.response.data.errors);
            }
        }
    }


    // ログインの関数
    const login = async (input: LoginInput) => {
        setErrors({})
        try {
            try {
                // もし古いセッションが残っていたら、一度ログアウトを試みてクッキーを掃除する
                // 失敗しても（元々ログインしてなくても）無視して進む
                await axios.post('/logout');
            } catch (e) {
                // すでにログアウト状態なら何もしない
            }
            await axios.get('/sanctum/csrf-cookie')
            await axios.post('/login', input)
            await getUser()
            router.push('/dashboard')
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors)
            }
        }
    }


    //ログアウト
    const logout = async () => {
        await axios.post('/logout')
        setUser(null)
        router.push('/login')
    }

    //このhooksが呼ばれたときに自動でgetUserを実行、ページを開いたとき「ログイン中かどうか」を自動で確認する
    useEffect(() => {
        getUser()
    }, [])

    useEffect(() => {
        if (isLoading) return;

        //ログインが必要なページにユーザーがいない場合
        if (config.middleware === 'auth' && !user) {
            router.push('/login')
        }

        //ログインしてはいけないページなのにユーザーがいる場合
        if (config.middleware === 'guest' && user) {
            router.push('/dashboard')
        }
    },[user,isLoading,config.middleware])
    
    return {
        user,
        isLoading,
        errors,
        register,
        login,
        logout,
    }
}