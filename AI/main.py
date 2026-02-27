# main.py
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI,File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import pymysql
import os
import uvicorn
import base64

# 🚨 1. 우리가 만든 DB와 AI 함수들 불러오기

from database import get_connection
from ai_service import recommend_exhibitions, generate_multilingual_docent, generate_course_text_v3

app = FastAPI(title="ArtLog API Server")

origins = [
    "http://54.180.234.226:8000",  # AWS EC2에서 FastAPI가 돌아가는 주소
    "https://my-mobile-test.vercel.app",  # 배포된 리액트 주소
    "http://localhost:5173",
    "http://localhost:5174",      # 로컬 개발용 주소
]
os.makedirs("audio", exist_ok=True) # 폴더가 없으면 에러나니까 자동 생성
app.mount("/audio", StaticFiles(directory="audio"), name="audio")
# 🚨 2. 프론트엔드 연동을 위한 CORS 설정 (리액트의 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 🚨 3. AI 오디오 파일(MP3) 경로 설정
os.makedirs("audio", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio"), name="audio")
# ==========================================
# 📡 [API 1] 전체 전시 목록 보내주기
# ==========================================
@app.get("/api/events")
def get_events():
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            # lat이 0이거나 빈칸인 '가짜 좌표'들 필터링
            sql = """SELECT title, place_name, lat, lng, start_date, end_date, image_url, category as hashtag
                     FROM event
                     WHERE lat IS NOT NULL AND lat != '0' AND lat != '0.0'"""
            cursor.execute(sql)
            events = cursor.fetchall()
        return {"status": "success", "total": len(events), "data": events}
    finally:
        conn.close()

# ==========================================
# 🤖 [API 2] 취향 기반 전시 추천
# ==========================================
class RecommendReq(BaseModel):
    tags: list # 프론트에서 ["화려한", "트렌디한"] 형태로 보냄

@app.post("/api/ai/recommend")
def api_recommend(req: RecommendReq):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT title, place_name, image_url, category as hashtag FROM event LIMIT 200")
            all_events = cursor.fetchall()

        results = recommend_exhibitions(req.tags, all_events)
        return {"status": "success", "data": results}
    finally:
        conn.close()

# ==========================================
# 🎤 [API 3] AI 도슨트 오디오 생성
# ==========================================
class DocentReq(BaseModel):
    title: str
    text: str
    style: str = "kind"

@app.post("/api/ai/docent")
async def api_docent(
    file: UploadFile = File(...),
    lang: str = Form(...)
):
    # 1. 사진을 파일로 저장하지 않고, 바로 읽어서 글자(Base64)로 변환!
    file_content = await file.read()
    base64_image = base64.b64encode(file_content).decode('utf-8')

    # 2. OpenAI가 좋아하는 "데이터 URL" 형식으로 만들기
    # (주의: 파일 확장자에 따라 image/jpeg, image/png 등으로 자동 인식됨)
    image_data = f"data:{file.content_type};base64,{base64_image}"

    # 3. 다국어 도슨트 실행 (인터넷 주소 대신, 사진 데이터 자체를 넘겨줌)
    result = generate_multilingual_docent(image_data, lang)

    return {"status": "success", "data": result}

# ==========================================
# 🗺️ [API 4] 나들이 코스 추천
# ==========================================
# 1. 모델 수정: 전시회 이름 대신 '목적지(destination)'를 받습니다.
class CourseReq(BaseModel):
    destination: str  # 사용자가 검색창에 입력한 지역 (예: "성수", "한남동")
    who: str          # 누구와 가는지 (예: "연인", "친구", "아이", "부모님")

# 2. 로직 수정: DB 검색 + AI 코스 생성
@app.post("/api/ai/course")
def api_course(req: CourseReq):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            # [DB 검색] 사용자가 입력한 지역에 있는 전시회 1개를 먼저 찾습니다.
            # 주소(place_name)나 제목(title)에 검색어가 포함된 최신 전시를 가져옵니다.
            sql = """
                SELECT title, place_name, lat, lng
                FROM event
                WHERE (place_name LIKE %s OR title LIKE %s)
                AND lat != '0'
                ORDER BY start_date DESC LIMIT 1
            """
            cursor.execute(sql, (f"%{req.destination}%", f"%{req.destination}%"))
            exhibition = cursor.fetchone()

        # [AI 호출]
        # 전시회가 있으면 전시회 기반으로, 없으면 지역명 기반으로 코스를 짭니다.
        # (ai_service.py에 새로 만든 v3 함수를 호출합니다.)
        plan = generate_course_text_v3(req.destination, req.who, exhibition)

        return {"status": "success", "data": plan}

    except Exception as e:
        print(f"❌ 코스 생성 중 에러 발생: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()
# ==========================================
# 🛠️ 팀장님 전용 카카오맵 테스트 화면
# ==========================================
KAKAO_JS_KEY = "1cc92d0b3666ef740a88e12a74a1fe06"
@app.get("/map", response_class=HTMLResponse)
def show_map():
    return f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"/><title>지도 테스트</title>
    <style>body, html {{ margin: 0; height: 100%; }} #map {{ width: 100%; height: 100%; }}</style>
    </head><body><div id="map"></div>
    <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey={KAKAO_JS_KEY}"></script>
    <script>
        var map = new kakao.maps.Map(document.getElementById('map'), {{center: new kakao.maps.LatLng(37.5665, 126.9780), level: 7}});
        fetch("/api/events").then(r => r.json()).then(res => {{
            res.data.forEach(evt => {{
                if (evt.lat && evt.lng) {{
                    var m = new kakao.maps.Marker({{ position: new kakao.maps.LatLng(evt.lat, evt.lng), map: map }});
                    var iw = new kakao.maps.InfoWindow({{ content : '<div style="padding:5px;"><b>'+evt.title+'</b></div>', removable : true }});
                    kakao.maps.event.addListener(m, 'click', () => iw.open(map, m));
                }}
            }});
        }});
    </script></body></html>
    """

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)