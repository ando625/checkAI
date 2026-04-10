# Geminiを使ってユーザーが書いた報告を読み取りスコアをつけるプログラム

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import re
from typing import Literal
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# --- 追加：LlamaIndex の初期設定 ---
# AIの脳（LLM）と、文字をベクトル化するエンジン（Embedding）を設定

Settings.llm = Gemini(
    model_name="models/gemini-2.5-flash", 
    api_key=os.environ["GEMINI_API_KEY"]
)

# AIの「理解力（Embedding）」を設定
# GoogleのAPIを通さず、自分のPC内で計算する方式（HuggingFace）に
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

index = None

# マニュアルを読み込んで、AIが検索できる状態にする関数
def get_query_engine():
    global index
    if index is None:
        # dataフォルダがなければ作ります
        if not os.path.exists("./data"):
            os.makedirs("./data")
        
        # dataフォルダの中にあるPDFやテキストをすべて読み取り
        documents = SimpleDirectoryReader("./data").load_data()
        
        if not documents:
            return None
            
        # 読み取った内容を元に、AI専用の「索引」を作ります
        index = VectorStoreIndex.from_documents(documents)
    
    # AIが質問に答えるための「窓口（エンジン）」を返します
    return index.as_query_engine()


app = FastAPI(title="CheckPoint AI Service")

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel("gemini-2.5-flash")


# -------------------------
# スキーマ　ルールの定義
# -------------------------
# APIリクエストの設計図
class AnalyzeRequest(BaseModel):
    content: str

# AIPレスポンスの設計図
class AnalyzeResponse(BaseModel):
    status: Literal["順調", "リスクあり", "要確認"]  # ← Literalに変更
    score_total: int
    score_positive: int
    score_negative: int
    ai_summary: str


# Lravelから送られてくるデータ型
class InsightsRequest(BaseModel):
    reports: list[str]          # 報告書の内容テキスト（複数件）
    weekly_scores: list[dict]   # 週間スコア [{"date":"03/20","score":72}, ...]
    monthly_scores: list[dict]  # 月別スコア [{"month":"3月","score":68}, ...]
    current_avg: float          # 現在の平均スコア
    risk_count: int             # リスク報告数

# Geminiが返すトピック１件分の型
class TopicItem(BaseModel):
    title: str          # トピック名
    description: str    # 説明
    count: int          # 該当報告数
    trend: str          # "増加中" / "安定" / "減少中"

# Geminiが返す予測の型
class PredictionResult(BaseModel):
    predicted_score: int    # 来週の予測スコア
    trend: str              # "上昇" / "安定" / "下降"
    confidence: str         # "高" / "中" / "低"
    reason: str             # 予測の根拠
    alert: bool             # 警告が必要かどうか
    alert_message: str | None  # 警告メッセージ（alertがFalseならnull）
    action: str             # 推奨アクション

# Geminiが返す「感情分析」の型
class SentimentResult(BaseModel):
    joy: int          # 喜び・達成感 (0-100)
    stress: int       # ストレス・疲労 (0-100)
    confidence: int   # 自信・前向き度 (0-100)
    concern: int      # 懸念・不安 (0-100)

# フロントに返す完成データ
class InsightsResponse(BaseModel):
    topics: list[TopicItem]        #トピック一覧
    prediction: PredictionResult   #未来予測
    sentiment: SentimentResult     #感情分析
    overall_summary: str           #全体的な一言まとめ


# --- 追加：RAG専用のレスポンス型 ---
class AskManualResponse(BaseModel):
    answer: str

# -------------------------
# プロンプト AIに渡す指示テンプレート 役割を与えると精度が上がる
# -------------------------
PROMPT_TEMPLATE = """
あなたは業務報告を分析するAIアシスタントです。
以下の業務報告テキストを分析し、必ずJSON形式のみで回答してください。
余分な説明やMarkdownは不要です。JSONだけ返してください。

【業務報告】
{content}

【出力形式】
{{
    "status":"順調"または"リスクあり"または"要確認",
    "score_total":0から100の整数（総合的な業務状態スコア。高いほど良好）,
    "score_positive":0から60の整数（ポジティブな要素の得点）,
    "score_negative":0から60の整数（ネガティブな要素の減点）,
    "ai_summary":"20〜50文字程度の日本語要約。状況・課題・推奨アクションを含める"
}}

【判定基準】
- 順調: 進捗良好・目標達成・問題なし -> score_total 70以上
- リスクあり: 遅延・問題発生・緊急対応が必要 -> score_total 40未満
- 要確認: どちらとも言えない・情報不足 -> score_total 40〜69
"""

INSIGHTS_PROMPT_TEMPLATE = """
あなたは業務チームのパフォーマンスを分析するAIアシスタントです。
以下のデータをもとに分析を行い、JSONのみを返してください。
説明文やMarkdownは不要です。

【報告書一覧（最新{report_count}件）】
{reports_text}

【過去7日間のスコア推移】
{weekly_text}

【過去4ヶ月の月別平均スコア】
{monthly_text}

【現状サマリー】
- 現在の平均スコア: {current_avg}点
- リスク報告数: {risk_count}件

以下のJSON形式で回答してください：

{{
    "topics": [
    {{
        "title": "トピック名（10文字以内）",
        "description": "具体的な説明（30文字以内）",
        "count": 該当する報告数（整数）,
        "trend": "増加中" または "安定" または "減少中"
    }}
    ],
    "prediction": {{
        "predicted_score": 来週の予測スコア（0〜100の整数）,
        "trend": "上昇" または "安定" または "下降",
        "confidence": "高" または "中" または "低",
        "reason": "予測の根拠（50文字以内）",
        "alert": true または false,
        "alert_message": "警告メッセージ（alertがtrueのとき40文字以内、falseのときはnull）",
        "action": "マネージャーへの推奨アクション（40文字以内）"
    }},
    "sentiment": {{
        "joy": 0〜100の整数（チーム全体の喜び・達成感の平均）,
        "stress": 0〜100の整数（ストレス・疲労の平均）,
        "confidence": 0〜100の整数（自信・前向き度の平均）,
        "concern": 0〜100の整数（懸念・不安の平均）
    }},
    "overall_summary": "チーム全体の状況を一言で（50文字以内）"
}}


"""



# -------------------------
# エンドポイント 外部（Laravelなど）からアクセスできる『専用の窓口』を設置する
# -------------------------
# サーバーが正常に動いているかどうかのチェックする関数
@app.get("/health")
def health():
    return{"status":"OK"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    # 入力が空または5文字未満ならエラーを返す
    if not req.content or len(req.content.strip()) < 5:
        raise HTTPException(status_code=422, detail="content が短すぎます")

    prompt = PROMPT_TEMPLATE.format(content=req.content.strip())

    # Gemini呼び出し
    try:
        # Geminiに文書を送る
        response = model.generate_content(prompt)
        # stripで空白を削除してAIの返答を取得
        raw = response.text.strip()

        # Markdownコードブロックが混入した場合に除去 JSON形式から配列の方へ
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        data = json.loads(raw)
    # エラー処理
    except json.JSONDecodeError:
        raise HTTPException(status_code=502,detail="AIの応答をパースできませんでした")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gimini APIエラー: {str(e)}")

    # 許可する値のセットを定義 statusバリデーション
    VALID_STATUSES = {"順調", "リスクあり", "要確認"}
    # Geminiが返したstatusを取得
    status_value = data.get("status", "要確認")
    # 許可リストに無い値だったら「要確認」に強制上書き
    if status_value not in VALID_STATUSES:
        status_value = "要確認"

    # スコアの取り出し
    score_positive = max(0, min(60, int(data.get("score_positive", 0))))
    score_negative = max(0, min(60, int(data.get("score_negative", 0))))
    score_total    = max(0, min(100, int(data.get("score_total",    50))))

    # Geminiが計算した total と、positive - negative を比較する
    calculated_total = score_positive - score_negative

    # 許容誤差：±10点以内ならOKとする
    # （AIなので毎回ぴったり一致するとは限らないため）
    TOLERANCE = 10

    if abs(score_total - calculated_total) > TOLERANCE:
        # 矛盾している場合は positive - negative で上書き
        score_total = max(0, min(100, calculated_total))

# 値の範囲を保証
    return AnalyzeResponse(
        status=status_value,
        score_total=score_total,
        score_positive=score_positive,
        score_negative=score_negative,
        ai_summary=data.get("ai_summary", "分析結果を取得できませんでした。"),
    )

# --- /insights（新規：複数報告のまとめ分析）---
@app.post("/insights", response_model=InsightsResponse)
async def insights(req: InsightsRequest):
    # 報告書が0件のときはエラー
    if not req.reports:
        raise HTTPException(status_code=422, detail="reports が空です")

    # 報告書を番号付きテキストにまとめる（最大30件でトークン節約）
    # [:30] → 先頭30件だけ取り出すスライス記法
    limited_reports = req.reports[:30]
    reports_text = "\n".join(
        f"{i+1}. {content.strip()}"
        for i, content in enumerate(limited_reports)
        # enumerate → (0,"内容"), (1,"内容")... のタプルを返す
    )

    # 週間スコアをテキスト化（scoreがNoneの日はスキップ）
    # .get("score") → キーがなくてもエラーにならない安全な取り出し方
    weekly_text = ", ".join(
        f"{d['date']}:{d['score']}点"
        for d in req.weekly_scores
        if d.get("score") is not None
    ) or "データなし"  # 全部Noneだったら"データなし"

    # 月別スコアをテキスト化
    monthly_text = ", ".join(
        f"{d['month']}:{d['score']}点"
        for d in req.monthly_scores
        if d.get("score") is not None
    ) or "データなし"

    # プロンプトの変数を全部埋める
    prompt = INSIGHTS_PROMPT_TEMPLATE.format(
        report_count=len(limited_reports),
        reports_text=reports_text,
        weekly_text=weekly_text,
        monthly_text=monthly_text,
        current_avg=req.current_avg,
        risk_count=req.risk_count,
    )

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # /analyze と同じMarkdown除去処理
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        data = json.loads(raw)

    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AIの応答をパースできませんでした")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini APIエラー: {str(e)}")

    # --- バリデーション（Geminiが変な値を返したときの保険）---

    # topicsが配列でなければ空にする
    # isinstance(値, list) → 値がlist型かどうか確認
    raw_topics = data.get("topics", [])
    if not isinstance(raw_topics, list):
        raw_topics = []

    topics = [
        TopicItem(
            title=str(t.get("title", "不明"))[:10],         # 10文字で切る
            description=str(t.get("description", ""))[:30], # 30文字で切る
            count=max(0, int(t.get("count", 1))),
            # trend が許可値以外なら"安定"に上書き
            trend=t.get("trend", "安定")
                  if t.get("trend") in ["増加中", "安定", "減少中"]
                  else "安定",
        )
        for t in raw_topics
        if isinstance(t, dict)  # dictでない要素は無視
    ]

    # predictionのバリデーション
    p = data.get("prediction", {})
    prediction = PredictionResult(
        predicted_score=max(0, min(100, int(p.get("predicted_score", 50)))),
        trend=p.get("trend", "安定")
              if p.get("trend") in ["上昇", "安定", "下降"] else "安定",
        confidence=p.get("confidence", "中")
                   if p.get("confidence") in ["高", "中", "低"] else "中",
        reason=str(p.get("reason", "データ不足"))[:50],
        alert=bool(p.get("alert", False)),
        # alert_messageはalertがTrueのときだけ入れる、FalseならNone
        alert_message=str(p.get("alert_message"))[:40]
                      if p.get("alert_message") else None,
        action=str(p.get("action", "引き続き状況を確認してください"))[:40],
    )

    # sentimentのバリデーション（全項目0〜100に収める）
    s = data.get("sentiment", {})
    sentiment = SentimentResult(
        joy=max(0, min(100, int(s.get("joy", 50)))),
        stress=max(0, min(100, int(s.get("stress", 50)))),
        confidence=max(0, min(100, int(s.get("confidence", 50)))),
        concern=max(0, min(100, int(s.get("concern", 50)))),
    )

    return InsightsResponse(
        topics=topics,
        prediction=prediction,
        sentiment=sentiment,
        overall_summary=str(data.get("overall_summary", ""))[:50],
    )
    


# [RAG機能] マニュアルについてAIに質問する窓口
@app.post("/ask-manual", response_model=AskManualResponse)
async def ask_manual(req: AnalyzeRequest):
    if not req.content:
        raise HTTPException(status_code=422, detail="質問が空です")

    try:
        # マニュアルを準備
        engine = get_query_engine()
        
        # ファイルが何も読み込めていない場合の返事
        if engine is None:
            return AskManualResponse(answer="マニュアルファイルが ./data フォルダに見つかりませんでした。")
        
        # AIに「マニュアルに基づいて答えて」
        response = engine.query(f"社内マニュアルに基づいて日本語で回答してください: {req.content}")
        
        # AIの答えを返す
        return AskManualResponse(answer=str(response))
        
    except Exception as e:
        # 何かエラーが起きたら、サーバーを止めずにエラー内容を表示
        print(f"RAGエラーが発生しました: {e}")
        return AskManualResponse(answer="すみません、マニュアルを読み取る途中でエラーが起きました。")