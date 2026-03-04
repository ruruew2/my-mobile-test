# ai_service.py
from openai import OpenAI
import os
import requests
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
KAKAO_API_KEY=os.getenv("KAKAO_API_KEY") # 카카오 API 키 (좌표 확보용)
KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")
print("🚨🚨 파이썬이 읽은 키:", os.getenv("OPENAI_API_KEY"))    
def recommend_exhibitions(user_tags, exhibition_list):
    print(f"🤖 태그 매칭 추천 시작: 유저 취향 {user_tags}")
    
    # 1. 감성 태그를 실제 DB 카테고리로 연결해주는 매핑 사전
    # 유저가 '화려한'을 고르면 DB에서 '뮤지컬', '무용' 등을 찾게 해줍니다.
    TAG_MAP = {
        "화려한": ["뮤지컬", "무용(서양/한국무용)", "복합", "서커스/마술"],
        "몽환적인": ["연극", "무용(서양/한국무용)", "복합"],
        "생생한": ["연극", "대중음악", "축제-기타"],
        "정갈한": ["한국음악(국악)", "클래식", "전시/미술"],
        "트렌디한": ["대중음악", "뮤지컬", "복합"],
        "톡톡튀는": ["대중음악", "축제-기타", "서커스/마술"],
        "우아한": ["서양음악(클래식)", "무용(서양/한국무용)", "독주/독창회"],
        "은은한": ["서양음악(클래식)", "한국음악(국악)", "전시/미술"],
        "과감한": ["무용(서양/한국무용)", "연극", "복합"],
        "능동적인": ["축제-시민화합", "축제-문화/예술"],
        "웅장한": ["오페라", "서양음악(클래식)", "뮤지컬"],
        "깊이있는": ["서양음악(클래식)", "연극", "독주/독창회"],
        "고전적인": ["서양음악(클래식)", "한국음악(국악)", "오페라"],
        "자유로운": ["대중음악", "축제-기타", "재즈"],
        "압도적인": ["뮤지컬", "오페라", "서커스/마술"],
        "입체적인": ["복합", "연극", "전시/미술"],
        "다채로운": ["복합", "축제-문화/예술", "무용(서양/한국무용)"],
        "섬세한": ["서양음악(클래식)", "독주/독창회", "전시/미술"]
    }

    user_set = set(user_tags)
    
    # 2. 유저가 선택한 감성 태그들을 '장르' 리스트로 변환
    target_genres = []
    for tag in user_tags:
        if tag in TAG_MAP:
            target_genres.extend(TAG_MAP[tag])
    target_genres_set = set(target_genres) # 중복 제거
    
    scored_list = []
    
    for exh in exhibition_list:
        import re
        db_tags_str = exh.get('hashtag') or ""
        exh_tags = set([t.strip() for t in re.split(r'[,\s]+', db_tags_str) if t.strip()])
        
        # 🚨 수정된 핵심 로직: 
        # 유저가 고른 감성 태그가 DB 장르와 연결되는지(target_genres_set) 확인!
        match_count = len(target_genres_set.intersection(exh_tags))
        
        # 직접 매칭(글자가 아예 같을 때)되면 가산점 부여
        direct_match = len(user_set.intersection(exh_tags))
        exh['match_score'] = match_count + (direct_match * 2) 
        
        scored_list.append(exh)
    
    # 점수가 있는 것만 추리고 점수 높은 순으로 정렬
    scored_list = [e for e in scored_list if e['match_score'] > 0]
    scored_list.sort(key=lambda x: x['match_score'], reverse=True)

    # 만약 매칭되는 게 하나도 없으면? 랜덤으로 10개 던져주기 (비상 대책)
    if not scored_list:
        import random
        print("⚠️ 매칭 결과 0개: 랜덤 데이터를 반환합니다.")
        return random.sample(exhibition_list, min(len(exhibition_list), 10))

    return scored_list[:10]

import os

def generate_multilingual_docent(image_url, lang="ko"):
    """
    image_url: 사용자가 찍은 작품 사진 URL 또는 Base64 데이터 URL
    lang: 'ko', 'en', 'ja', 'ch' (선택된 언어)
    """
    print(f"🎤 AI 도슨트 생성 중... 언어: {lang} (스타일: Kind 고정)")

    # 1. 언어 명칭 매핑
    lang_map = {
        "ko": "Korean",
        "en": "English",
        "ja": "Japanese",
        "ch": "Chinese"
    }
    target_lang = lang_map.get(lang, "Korean")

    # 2. 페르소나 설정 (차분하고 우아한 도슨트로 고정)
    system_prompt = (
        f"너는 미술관의 차분하고 우아한 수석 도슨트야. "
        f"모든 설명을 반드시 {target_lang}로 오디오와 대본을 작성하고, 관람객에게 다정하게 존댓말로 설명해줘."
    )
    voice_model = "nova" # 차분하고 신뢰감 있는 보이스

    try:
        # 3. GPT-4o Vision으로 사진 분석 및 대본 생성
        response = client.chat.completions.create(
            model="gpt-4o", 
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": "이 작품 사진을 분석해서 제목, 작가, 그리고 작품의 의미를 포함한 도슨트 해설을 300자 내외로 작성해줘. 특수기호는 빼고 자연스러운 구어체로 써줘."
                        },
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            max_tokens=500
        )
        
        script = response.choices[0].message.content.strip()

        # 4. OpenAI TTS로 음성 생성
        audio_res = client.audio.speech.create(
            model="tts-1",
            voice=voice_model,
            input=script
        )

        # 파일명 생성 (언어와 이미지 경로 해시값 조합)
        os.makedirs("audio", exist_ok=True)
        filename = f"audio/docent_{lang}_{hash(image_url)}.mp3"
        audio_res.write_to_file(filename)
        
        return filename, script

    except Exception as e:
        print(f"❌ 다국어 도슨트 생성 중 에러: {e}")
        return None, None

# ==========================================
# 2. 카카오맵 API 연동: 근처 실제 맛집/카페 찾기
# ==========================================
def get_kakao_nearby_place(lat, lng, category_group_code):
    """
    category_group_code: FD6(음식점), CE7(카페)
    """
    url = "https://dapi.kakao.com/v2/local/search/category.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {
        "category_group_code": category_group_code,
        "y": lat, 
        "x": lng, 
        "radius": 1000, # 반경 1km 이내
        "sort": "accuracy" # 정확도순 (또는 'distance' 거리순 가능)
    }
    
    try:
        res = requests.get(url, headers=headers, params=params, timeout=5).json()
        if res.get('documents'):
            # 가장 상위에 검색된 1곳의 정보만 반환
            place = res['documents'][0]
            return {"name": place['place_name'], "url": place['place_url'], "distance": place['distance']}
    except Exception as e:
        print(f"❌ 카카오 API 호출 실패: {e}")
    return None


# 1. 카카오 키워드 검색 함수 (맛집, 카페 찾기용)
def get_kakao_place_by_keyword(keyword, category_code):
    """
    keyword: 검색어 (예: '성수 맛집')
    category_code: FD6(식당), CE7(카페)
    """
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {
        "query": keyword,
        "category_group_code": category_code,
        "size": 1  # 가장 연관성 높은 1곳만 선정
    }
    
    try:
        res = requests.get(url, headers=headers, params=params)
        data = res.json()
        if data['documents']:
            place = data['documents'][0]
            return {
                "name": place['place_name'],
                "address": place['address_name'],
                "url": place['place_url'],  # ⭐ Open Map 버튼에 쓸 카카오맵 주소
                "lat": place['y'],
                "lng": place['x']
            }
    except Exception as e:
        print(f"❌ 카카오 검색 에러 ({keyword}): {e}")
    return None

# 2. 지역 & 동행자 기반 코스 생성 로직 (전시회 포함)
def generate_course_text_v3(destination, who, exhibition):
    # 1. 전시 데이터가 있을 때와 없을 때를 명확히 구분
    if exhibition:
        exh_info = f"전시 제목: {exhibition['title']}, 장소: {exhibition['place_name']}"
        search_base = exhibition['place_name'] # 맛집 검색 기준점
    else:
        # DB에 없을 경우 GPT에게 가짜를 만들지 말라고 경고합니다.
        exh_info = "현재 해당 지역에 등록된 특정 전시회가 없음"
        search_base = destination

    # 2. 실제 맛집/카페 데이터 가져오기 (카카오 API)
    restaurant = get_kakao_place_by_keyword(f"{search_base} 맛집", "FD6")
    cafe = get_kakao_place_by_keyword(f"{search_base} 카페", "CE7")

    # 3. GPT 프롬프트 (강력한 제약 조건 추가)
    prompt = f"""
    당신은 나들이 가이드입니다. 아래 제공된 [실제 정보]만을 사용하여 코스를 짜주세요.
    절대로 존재하지 않는 전시회나 장소를 지어내지 마세요.

    [실제 정보]
    - 지역: {destination}
    - 타겟: {who}
    - 제공된 전시: {exh_info}
    - 제공된 식당: {restaurant['name'] if restaurant else '정보 없음'}
    - 제공된 카페: {cafe['name'] if cafe else '정보 없음'}

    [지침]
    1. 만약 '제공된 전시'가 '정보 없음'이라면, 전시 관람 대신 '{destination}' 거리 산책을 추천하세요.
    2. 모든 장소 명칭은 위 [실제 정보]에 적힌 이름 그대로 사용하세요.
    3. {who}의 취향에 맞춰 200자 이내로 다정하게 써주세요.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    story = response.choices[0].message.content.strip()

    # 4. 프론트엔드가 쓰기 좋게 최종 결과 반환
    return {
        "story": story, 
        "places": {
            "restaurant": {
                "name": restaurant['name'] if restaurant else "근처 맛집 정보 없음",
                "address": restaurant['address'] if restaurant else "정보 없음",
                "desc": "아띠의 식당 추천 이유", 
                "url": restaurant['url'] if restaurant else "#"
            },
                # ai_service.py의 return 부분 중 exhibition 섹션
            "exhibition": {
                "name": exhibition['title'] if exhibition else "현재 등록된 전시 없음",
                "address": exhibition['place_name'] if exhibition else "정보 없음",
                "desc": "아띠의 전시 / 공연 추천 이유", 
                # exhibition 객체에 'url'이 없을 경우를 대비해 get 사용
                "url": exhibition.get('url', "#") if exhibition else "#" 
            },
            "cafe": {
                "name": cafe['name'] if cafe else "근처 카페 정보 없음",
                "address": cafe['address'] if cafe else "정보 없음",
                "desc": "아띠의 카페 추천 이유",
                "url": cafe['url'] if cafe else "#"
            }
        }
    }