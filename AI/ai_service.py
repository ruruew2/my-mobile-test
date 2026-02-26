# ai_service.py
from openai import OpenAI
import os
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import requests
import base64

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
KAKAO_API_KEY = os.getenv("KAKAO_API_KEY")

# ==========================================
# 1. 텍스트 -> 벡터 변환 (임베딩)
# ==========================================
def get_embedding(text):
    text = text.replace("\n", " ")
    response = client.embeddings.create(input=[text], model="text-embedding-3-small")
    return response.data[0].embedding

# ==========================================
# 2. 전시회 추천 로직
# ==========================================
def recommend_exhibitions(user_tags, exhibition_list):
    """
    user_tags: "힙한 성수동 데이트"
    exhibition_list: 수집한 전시회 데이터 리스트
    """
    print(f"🤖 추천 분석 시작: {user_tags}")
    user_vec = get_embedding(user_tags)
    
    scored_list = []
    for exh in exhibition_list:
        exh_vec = get_embedding(exh['desc'])
        score = cosine_similarity([user_vec], [exh_vec])[0][0]
        exh['score'] = score
        scored_list.append(exh)
    
    scored_list.sort(key=lambda x: x['score'], reverse=True)
    return scored_list[:3]

# ==========================================
# 3. AI 도슨트 (TTS)
# ==========================================
def generate_docent_audio(script, style="kind", title="default"):
    """
    script: 도슨트 멘트 텍스트
    style: "kind"(기본), "funny"(재미있게)
    title: 파일명에 사용할 전시 제목
    """
    try:
        print(f"🎤 오디오 생성 중... 스타일: {style}")
        system_prompt = "너는 친절한 미술관 도슨트야."
        voice_model = "nova"  # 기본 여성 톤

        if style == "funny":
            system_prompt = "너는 아주 재밌고 유쾌한 친구 같은 도슨트야."
            voice_model = "onyx"  # 남성 톤

        audio_res = client.audio.speech.create(
            model="tts-1",
            voice=voice_model,
            input=script
        )

        filename = f"audio/docent_{title}_{style}.mp3"
        audio_res.write_to_file(filename)
        print(f"🎧 오디오 파일 저장 완료: {filename}")
        return filename, script

    except Exception as e:
        print(f"❌ 도슨트 생성 중 에러 발생: {e}")
        return None, None

# ==========================================
# 4. 카카오맵 API 연동: 근처 맛집/카페
# ==========================================
def get_kakao_nearby_place(lat, lng, category_group_code):
    """
    category_group_code: FD6(음식점), CE7(카페)
    """
    url = "https://dapi.kakao.com/v2/local/search/category.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"category_group_code": category_group_code, "y": lat, "x": lng, "radius": 1000, "sort": "accuracy"}
    
    try:
        res = requests.get(url, headers=headers, params=params, timeout=5).json()
        if res.get('documents'):
            place = res['documents'][0]
            return {"name": place['place_name'], "url": place['place_url'], "distance": place['distance']}
    except Exception as e:
        print(f"❌ 카카오 API 호출 실패: {e}")
    return None

# ==========================================
# 5. 데이터 기반 나들이 코스 생성
# ==========================================
def generate_course_text(exhibition_title, lat, lng, who):
    print(f"🗺️ {who}와의 코스 기획 중... (카카오 장소 검색 포함)")
    restaurant = get_kakao_nearby_place(lat, lng, "FD6")
    cafe = get_kakao_nearby_place(lat, lng, "CE7")
    
    prompt = f"""
    메인 전시: {exhibition_title}
    위치: {lat},{lng}
    동행: {who}
    
    위 정보를 바탕으로 {who}과 함께하기 좋은 '전시 나들이 코스'를 추천해줘.
    [식사] -> [전시 관람] -> [카페] 순서로 실제 장소를 포함해서 작성해줘.
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

    # ==========================================
# 6. 이미지 분석 (Vision API)
# ==========================================
def analyze_art_image(image_bytes):
    """
    image_bytes: 리액트에서 전송된 이미지 바이너리 데이터
    """
    try:
        print("🎨 AI가 이미지를 분석하고 있습니다...")
        
        # 1. 이미지를 Base64로 인코딩 (GPT Vision 전송용)
        base64_image = base64.b64encode(image_bytes).decode('utf-8')

        # 2. GPT-4o 모델에게 이미지 분석 요청
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # 가성비 좋은 mini 모델도 비전 기능을 지원합니다.
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 미술 작품의 제목, 작가, 제작 연도, 그리고 2~3문장 정도의 도슨트 해설을 알려줘. 응답은 반드시 '제목: [제목], 작가: [작가], 연도: [연도], 해설: [해설]' 형식으로 보내줘."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        },
                    ],
                }
            ],
            max_tokens=300,
        )

# 3. GPT 응답 텍스트 파싱 (더 튼튼한 버전)
        ai_text = response.choices[0].message.content
        print(f"🤖 AI 응답: {ai_text}")

        result = {}
        # 콤마나 줄바꿈 중 아무거나 기준으로 잘라버리기
        import re
        parts = re.split(r'[,\n]', ai_text) 
        
        for part in parts:
            part = part.strip()
            if '제목:' in part: result['title'] = part.replace('제목:', '').strip()
            elif '작가:' in part: result['artist'] = part.replace('작가:', '').strip()
            elif '연도:' in part: result['year'] = part.replace('연도:', '').strip()
            elif '해설:' in part: result['description'] = part.replace('해설:', '').strip()

        # 데이터 누락 시 기본값 처리
        if not result.get('title'):
            result = {
                "title": "분석된 작품",
                "artist": "알 수 없음",
                "year": "미상",
                "description": ai_text
            }
        return result

    except Exception as e:
        print(f"❌ 이미지 분석 중 에러 발생: {e}")
        return None