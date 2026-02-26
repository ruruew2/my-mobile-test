from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import pymysql
import os
import uvicorn

# 수정된 ai_service 임포트
from database import get_connection
from ai_service import recommend_exhibitions, generate_docent_audio, generate_course_text_v3

app = FastAPI(title="ArtLog API Server")

# CORS 설정
origins = [
    "http://54.180.234.226:8000",
    "https://my-mobile-test.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 오디오 경로 설정
os.makedirs("audio", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio"), name="audio")

# [API 1] 전체 전시 목록
@app.get("/api/events")
def get_events():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """SELECT title, place_name, lat, lng, start_date, end_date, image_url, category as hashtag 
                     FROM event 
                     WHERE lat IS NOT NULL AND lat != '0' AND lat != '0.0'"""
            cursor.execute(sql)
            events = cursor.fetchall()
        return {"status": "success", "total": len(events), "data": events}
    finally:
        conn.close()

# [API 2] 취향 기반 전시 추천
class RecommendReq(BaseModel):
    tags: list

@app.post("/api/ai/recommend")
def api_recommend(req: RecommendReq):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT title, place_name, image_url, category as hashtag FROM event LIMIT 200")
            all_events = cursor.fetchall()
        
        # ai_service의 추천 함수 호출
        results = recommend_exhibitions(req.tags, all_events)
        return {"status": "success", "data": results}
    except Exception as e:
        print(f"❌ 추천 API 에러: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

# [API 3] AI 도슨트 생성
class DocentReq(BaseModel):
    title: str
    text: str
    style: str = "kind"

@app.post("/api/ai/docent")
def api_docent(req: DocentReq):
    filename, script = generate_docent_audio(req.title, req.text, req.style)
    if filename:
        YOUR_AWS_IP = "54.180.234.226" # 실제 환경에 맞게 수정 가능
        audio_url = f"http://{YOUR_AWS_IP}:8000/audio/{filename}"
        return {"status": "success", "script": script, "audio_url": audio_url}
    return {"status": "fail", "message": "도슨트 생성 실패"}

# [API 4] 나들이 코스 추천
class CourseReq(BaseModel):
    exh_name: str
    who: str
    lat: str = "37.5665"
    lng: str = "126.9780"

@app.post("/api/ai/course")
def api_course(req: CourseReq):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            # 입력받은 지역/전시명으로 DB 검색
            sql = """
                SELECT title, place_name, lat, lng 
                FROM event 
                WHERE (place_name LIKE %s OR title LIKE %s)
                AND lat != '0' 
                ORDER BY start_date DESC LIMIT 1
            """
            cursor.execute(sql, (f"%{req.exh_name}%", f"%{req.exh_name}%"))
            exhibition = cursor.fetchone()
            
        plan = generate_course_text_v3(req.exh_name, req.who, exhibition)
        return {"status": "success", "data": plan}
    except Exception as e:
        print(f"❌ 코스 API 에러: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)