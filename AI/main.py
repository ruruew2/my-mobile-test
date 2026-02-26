# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import pymysql
import os
import uvicorn

# 🚨 1. 우리가 만든 DB와 AI 함수들 불러오기
from database import get_connection
from ai_service import recommend_exhibitions, generate_docent_audio, generate_course_text
from fastapi import UploadFile, File

app = FastAPI(title="ArtKok API Server")

# 🚨 2. 프론트엔드 연동을 위한 CORS 설정 (리액트의 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚨 3. AI 오디오 파일(MP3)을 리액트가 가져갈 수 있게 폴더 개방!
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
def api_docent(req: DocentReq):
    filename, script = generate_docent_audio(req.title, req.text, req.style)
    
    if filename:
        # 리액트가 바로 재생할 수 있는 MP3 주소와 대본 자막을 같이 넘겨줌
        audio_url = f"http://localhost:8000/{filename}"
        return {"status": "success", "script": script, "audio_url": audio_url}
    else:
        return {"status": "fail", "message": "도슨트 생성에 실패했습니다."}

# ==========================================
# 🗺️ [API 4] 나들이 코스 추천
# ==========================================
class CourseReq(BaseModel):
    exh_name: str
    lat: str
    lng: str
    who: str

@app.post("/api/ai/course")
def api_course(req: CourseReq):
    plan = generate_course_text(req.exh_name, req.lat, req.lng, req.who)
    return {"status": "success", "data": plan}

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

def get_unique_exhibitions():
    # 1. 모든 소스에서 데이터 긁어모으기
    all_data = []
    all_data.extend(fetch_kopis_data())       # KOPIS
    all_data.extend(fetch_seoul_events())     # 서울시
    all_data.extend(fetch_interpark_ranking())# 인터파크
    
    print(f"📚 총 수집된 데이터: {len(all_data)}개 (중복 포함)")
    
    # 2. 중복 제거를 위한 딕셔너리 (Key: 제목+장소)
    unique_dict = {}
    
    for item in all_data:
        # 키 만들기: 공백 제거하고 제목+장소 합침 (예: "팀버튼특별전DDP")
        # 이렇게 하면 출처가 달라도 제목과 장소가 같으면 같은 키가 됨
        clean_title = item['title'].replace(" ", "")
        clean_place = item['place'].replace(" ", "")
        unique_key = f"{clean_title}_{clean_place}"
        
        if unique_key not in unique_dict:
            # 처음 본 데이터면 저장
            unique_dict[unique_key] = item
        else:
            # 이미 있는 데이터면? -> 정보 보강 (Merge)
            # 예: 기존 데이터엔 이미지가 없는데, 새 데이터엔 있으면 채워넣기
            existing = unique_dict[unique_key]
            if not existing.get('image') and item.get('image'):
                existing['image'] = item['image']
            if not existing.get('price') and item.get('price'):
                existing['price'] = item['price']
                
    # 3. 딕셔너리 값을 리스트로 변환
    final_list = list(unique_dict.values())
    print(f"✨ 중복 제거 후 최종 데이터: {len(final_list)}개")
    
    return final_list


    # ==========================================
# 🖼️ [API 5] 카메라 스캔 작품 분석 (Arty)
# ==========================================
# ai_service.py에 analyze_art_image 함수가 있다고 가정합니다.
from ai_service import analyze_art_image 

@app.post("/api/ai/analyze-scan")
async def api_analyze_scan(image: UploadFile = File(...)):
    try:
        # 1. 리액트에서 보낸 이미지 파일 읽기
        contents = await image.read()
        
        # 2. ai_service.py의 분석 함수 호출 (이미지 바이트 전송)
        # 이 함수에서 OpenAI Vision API 등을 사용하여 제목, 작가, 해설을 뽑아냅니다.
        analysis_result = analyze_art_image(contents)
        
        if analysis_result:
            return {
                "status": "success",
                "data": analysis_result  # {title, artist, year, description} 포함
            }
        else:
            return {"status": "fail", "message": "작품을 인식하지 못했습니다."}
            
    except Exception as e:
        print(f"Error during scan: {e}")
        return {"status": "error", "message": str(e)}