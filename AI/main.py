from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pymysql
import os
import uvicorn
from database import get_connection
import ai_service

app = FastAPI()

# CORS 설정 (Vercel 및 모든 접속 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 오디오 저장 폴더 및 스태틱 경로 설정
if not os.path.exists("audio"):
    os.makedirs("audio")
app.mount("/audio", StaticFiles(directory="audio"), name="audio")

# 1. 전체 이벤트 목록
@app.get("/api/events")
def get_events():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT title, place_name, lat, lng, image_url, category as hashtag FROM event")
            return {"status": "success", "data": cursor.fetchall()}
    finally: conn.close()

# 2. 취향 추천 API
class RecommendReq(BaseModel):
    tags: list
@app.post("/api/ai/recommend")
def api_recommend(req: RecommendReq):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM event LIMIT 100")
            all_events = cursor.fetchall()
        return {"status": "success", "data": ai_service.recommend_exhibitions(req.tags, all_events)}
    finally: conn.close()

# 3. AI 도슨트 스캔 API (핵심)
@app.post("/api/ai/analyze-scan")
async def analyze_scan(image: UploadFile = File(...), lang: str = Form("ko")):
    temp_path = f"audio/temp_{image.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await image.read())
    
    audio_file, script = ai_service.generate_multilingual_docent(temp_path, lang)
    
    if not script:
        return {"status": "error", "message": "분석 실패"}
    
    return {
        "status": "success",
        "data": {
            "title": "분석된 작품",
            "artist": "AI 도슨트 아티",
            "year": "2026",
            "description": script,
            "audio_url": f"http://54.180.234.226:8000/{audio_file}"
        }
    }

# 4. 코스 추천 API
class CourseReq(BaseModel):
    destination: str
    who: str
@app.post("/api/ai/course")
def api_course(req: CourseReq):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM event WHERE place_name LIKE %s LIMIT 1", (f"%{req.destination}%",))
            exhibition = cursor.fetchone()
        plan = ai_service.generate_course_text_v3(req.destination, req.who, exhibition)
        return {"status": "success", "data": plan}
    finally: conn.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)