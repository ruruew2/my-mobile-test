# main.py
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from api_crawler import fetch_kopis_data
from ai_service import recommend_exhibitions, generate_docent_audio, generate_course_text
import os
from dotenv import load_dotenv 

# .env 파일 로드
load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")
kakao_key = os.getenv("KAKAO_REST_API_KEY")

app = FastAPI()

# 간단한 메모리 DB (서버 켜져있는 동안만 데이터 저장)
# 실제론 MySQL 같은 DB를 써야 함
global_exhibitions = [] 

# [초기화] 서버 켜질 때 데이터 한 번 긁어오기
@app.on_event("startup")
def startup_event():
    global global_exhibitions
    global_exhibitions = fetch_kopis_data() # KOPIS 크롤링 실행

# 1. 데이터 강제 업데이트 API
@app.get("/update-data")
def update_data():
    global global_exhibitions
    global_exhibitions = fetch_kopis_data()
    return {"message": "업데이트 완료", "count": len(global_exhibitions)}

# 2. 전시 추천 API
class UserReq(BaseModel):
    tags: str # 예: "힙한 전시"

@app.post("/recommend")
def recommend(req: UserReq):
    if not global_exhibitions:
        return {"error": "데이터가 없습니다. /update-data 를 먼저 호출하세요."}
    
    results = recommend_exhibitions(req.tags, global_exhibitions)
    return {"results": results}

# 3. 도슨트 오디오 API
class DocentReq(BaseModel):
    text: str
    style: str = "kind"

@app.post("/docent")
def docent(req: DocentReq):
    file_path = generate_docent_audio(req.text, req.style)
    return FileResponse(file_path, media_type="audio/mpeg", filename=file_path)

# 4. 코스 추천 API
class CourseReq(BaseModel):
    exh_name: str
    location: str
    who: str

@app.post("/course")
def course(req: CourseReq):
    plan = generate_course_text(req.exh_name, req.location, req.who)
    return {"plan": plan}