# main.py
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from api_crawler import fetch_kopis_data
from ai_service import recommend_exhibitions, generate_docent_audio, generate_course_text
import os
from dotenv import load_dotenv 
from seoul_api import fetch_seoul_events
from interpark_api import fetch_interpark_ranking
from arthub_crawler import crawl_arthub

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