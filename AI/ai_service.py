import os
import re
import base64
import requests
import numpy as np
from dotenv import load_dotenv
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity

# 환경 변수 로드
load_dotenv()

# OpenAI 클라이언트 설정 및 키 확인
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("⚠️ 경고: .env 파일에 OPENAI_API_KEY가 없습니다.")

client = OpenAI(api_key=api_key)
KAKAO_API_KEY = os.getenv("KAKAO_API_KEY")

# ==========================================
# 1. 공통 유틸리티 (임베딩 및 API 호출)
# ==========================================
def get_embedding(text):
    """텍스트를 벡터로 변환 (추천 로직용)"""
    try:
        # 🚨 [수정] 입력값이 리스트일 경우 문자열로 병합하여 AttributeError 방지
        if isinstance(text, list):
            text = " ".join(map(str, text))
        
        # text가 None이거나 비어있을 경우 처리
        if not text:
            text = "empty"

        text = text.replace("\n", " ")
        response = client.embeddings.create(input=[text], model="text-embedding-3-small")
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ 임베딩 생성 실패 (키 확인 필요): {e}")
        # 에러 발생 시 0으로 채워진 기본 벡터 반환 (프로그램 중단 방지)
        return [0.0] * 1536

def get_kakao_nearby_place(lat, lng, category_group_code):
    """카카오맵 API를 사용하여 주변 장소(식당 FD6, 카페 CE7) 검색"""
    if not KAKAO_API_KEY:
        print("⚠️ 카카오 API 키가 설정되지 않았습니다.")
        return None

    url = "https://dapi.kakao.com/v2/local/search/category.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {
        "category_group_code": category_group_code,
        "y": lat,
        "x": lng,
        "radius": 1000,
        "sort": "accuracy"
    }
    try:
        res = requests.get(url, headers=headers, params=params, timeout=5).json()
        if res.get('documents'):
            place = res['documents'][0]
            return {
                "name": place['place_name'],
                "url": place['place_url'],
                "distance": place['distance']
            }
    except Exception as e:
        print(f"❌ 카카오 API 호출 실패: {e}")
    return None

# ==========================================
# 2. 스마트 전시회 추천 (임베딩 기반)
# ==========================================
def recommend_exhibitions(user_query, exhibition_list):
    """
    유저의 질문과 전시회 설명을 비교하여 코사인 유사도가 높은 순으로 추천
    """
    print(f"🤖 추천 분석 시작: {user_query}")
    user_vec = get_embedding(user_query)
    
    scored_list = []
    for exh in exhibition_list:
        desc = exh.get('desc', '') or exh.get('exh_name', '')
        exh_vec = get_embedding(desc)
        
        # 코사인 유사도 계산
        score = cosine_similarity([user_vec], [exh_vec])[0][0]
        exh['score'] = float(score)
        scored_list.append(exh)
    
    # 유사도 높은 순 정렬
    scored_list.sort(key=lambda x: x['score'], reverse=True)
    return scored_list[:3]

# ==========================================
# 3. AI 도슨트 오디오 생성 (TTS)
# ==========================================
def generate_docent_audio(title, text, style="kind"):
    """GPT로 대본을 다듬고 OpenAI TTS로 음성 파일 생성"""
    print(f"🎤 AI 도슨트 생성 중... 스타일: {style}")
    
    personas = {
        "kind": ("너는 국립현대미술관의 차분한 수석 도슨트야. 존댓말로 부드럽게 설명해줘.", "nova"),
        "funny": ("너는 유쾌한 예술가 친구야. 비하인드 스토리 위주로 반말로 재밌게 말해줘.", "onyx"),
        "kids": ("너는 유치원 선생님이야. 아이들이 이해하기 쉽게 동화처럼 말해줘.", "shimmer")
    }
    system_prompt, voice_model = personas.get(style, ("너는 객관적인 예술 평론가야.", "alloy"))

    gpt_prompt = f"""
    작품명: {title}
    기본 설명: {text}
    
    위 정보를 바탕으로 오디오 가이드 대본을 300자 내외로 작성해줘.
    [조건]
    1. TTS용이므로 특수문자나 숫자리스트는 절대 쓰지 마.
    2. 눈앞에 작품이 그려지도록 묘사하고 문장을 짧게 끊어줘.
    """
    
    try:
        gpt_res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": gpt_prompt}]
        )
        script = gpt_res.choices[0].message.content.strip()

        audio_res = client.audio.speech.create(
            model="tts-1",
            voice=voice_model,
            input=script
        )
        
        if not os.path.exists("audio"): 
            os.makedirs("audio")
        
        filename = f"audio/docent_{re.sub(r'[^a-zA-Z0-9가-힣]', '', title)}_{style}.mp3"
        audio_res.write_to_file(filename)
        return filename, script

    except Exception as e:
        print(f"❌ 도슨트 생성 오류: {e}")
        return None, None

# ==========================================
# 4. 데이터 기반 나들이 코스 생성
# ==========================================
def generate_course_text(exhibition_title, lat, lng, who):
    """주변 실제 맛집/카페 정보를 포함한 맞춤형 코스 스토리텔링"""
    print(f"🗺️ {who}와의 코스 기획 중...")
    
    restaurant = get_kakao_nearby_place(lat, lng, "FD6")
    cafe = get_kakao_nearby_place(lat, lng, "CE7")
    
    rest_info = f"{restaurant['name']} (도보 {restaurant['distance']}m)" if restaurant else "주변 맛집"
    cafe_info = f"{cafe['name']} (도보 {cafe['distance']}m)" if cafe else "근처 카페"
    
    prompt = f"""
    당신은 센스 있는 데이트 플래너입니다.
    메인 이벤트: {exhibition_title}
    식사: {rest_info}, 카페: {cafe_info}, 동행: {who}
    
    위 장소들을 포함해 완벽한 하루 코스를 300자 이내로 자연스럽게 추천해줘.
    장소 이름이 잘 보이게 작성해줘.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return {
            "story": response.choices[0].message.content.strip(),
            "places": {"restaurant": restaurant, "cafe": cafe}
        }
    except Exception as e:
        print(f"❌ 코스 생성 오류: {e}")
        return {"story": "코스를 생성하는 중 오류가 발생했습니다.", "places": {}}

# ==========================================
# 5. 이미지 분석 (Vision API)
# ==========================================
def analyze_art_image(image_bytes):
    """이미지를 분석하여 작품 정보 추출"""
    try:
        print("🎨 AI 이미지 분석 중...")
        base64_image = base64.b64encode(image_bytes).decode('utf-8')

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 작품의 제목, 작가, 연도, 해설을 '제목: [제목], 작가: [작가], 연도: [연도], 해설: [해설]' 형식으로 알려줘."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ],
                }
            ],
            max_tokens=300,
        )

        ai_text = response.choices[0].message.content
        result = {}
        for line in re.split(r'[,\n]', ai_text):
            line = line.strip()
            if '제목:' in line: result['title'] = line.replace('제목:', '').strip()
            elif '작가:' in line: result['artist'] = line.replace('작가:', '').strip()
            elif '연도:' in line: result['year'] = line.replace('연도:', '').strip()
            elif '해설:' in line: result['description'] = line.replace('해설:', '').strip()

        return result if result.get('title') else {"title": "분석된 작품", "description": ai_text}

    except Exception as e:
        print(f"❌ 이미지 분석 오류: {e}")
        return None