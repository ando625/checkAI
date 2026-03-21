export type User = {
    id: number
    name: string
    email: string
    email_verified_at: string | null
    created_at: string
    updated_at:string
}

//ログインフォームに入力するデータの型
export type LoginInput = {
    email: string
    password: string
    remember:boolean
}

//新規登録フォームに入力するデータの型
export type RegisterInput = {
    name: string
    email: string
    password: string
    password_confirmation:string
}

// laravelから返ってくるエラーメッセージの型
export type ValidationErrors = {
    [key:string]:string[]
}