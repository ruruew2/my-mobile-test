# ai_service.py
from openai import OpenAI
import os
import requests
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
KAKAO_API_KEY=os.getenv("KAKAO_API_KEY") # 카카오 API 키 (좌표 확보용)


# ==========================================
# 1. 취향 태그 기반 전시회 추천 (초고속 매칭)
# ==========================================
def recommend_exhibitions(user_tags, exhibition_list):
    """
    user_tags: 리스트 형태 ["화려한", "몽환적인", "트렌디한"]
    exhibition_list: DB에서 가져온 전시/공연 데이터 리스트 [{'title': '...', 'hashtag': '화려한, 생생한'}, ...]
    """
    print(f"🤖 태그 매칭 추천 시작: 유저 취향 {user_tags}")
    
    user_set = set(user_tags)
    scored_list = []
    
    for exh in exhibition_list:
        # DB에 저장된 "화려한, 웅장한" 문자열을 리스트(집합)로 변환
        db_tags_str = exh.get('hashtag') or ""
        exh_tags = set([t.strip() for t in db_tags_str.split(',') if t.strip()])
        
        # 🚨 핵심: 유저 취향과 공연 태그가 몇 개나 겹치는지(교집합) 계산!
        match_count = len(user_set.intersection(exh_tags))
        exh['match_score'] = match_count
        
        scored_list.append(exh)
    
    # 겹치는 태그가 많은 순으로 정렬 후 Top 3 반환
    scored_list.sort(key=lambda x: x['match_score'], reverse=True)
    return scored_list[:3]
import os

def generate_multilingual_docent(image_url, lang="ko"):
    """
    image_url: 사용자가 찍은 작품 사진 URL
    lang: 'ko', 'en', 'ja', 'zh' (선택된 언어)
    """
    print(f"🎤 AI 도슨트 생성 중... 언어: {lang} (스타일: Kind 고정)")

    # 1. 언어 명칭 매핑
    lang_map = {
        "ko": "Korean",
        "en": "English",
        "ja": "Japanese",
        "zh": "Chinese"
    }
    target_lang = lang_map.get(lang, "Korean")

    # 2. 페르소나 설정 (차분하고 우아한 도슨트로 고정)
    system_prompt = (
        f"너는 미술관의 차분하고 우아한 수석 도슨트야. "
        f"모든 설명을 반드시 {target_lang}로 작성하고, 관람객에게 다정하게 존댓말로 설명해줘."
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


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

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
    "story": story, # 전체 스토리
    "places": {
        "restaurant": {
            "name": restaurant['name'],
            "address": restaurant['address'],
            "desc": "아띠의 식당 추천 이유", # 👈 이런 식의 필드 추가
            "url": restaurant['url']
        },
        "exhibition": {
            "name": exhibition['title'] if exhibition else "정보 없음",
            "address": exhibition['place_name'] if exhibition else "정보 없음",
            "desc": "아띠의 전시 / 공연 추천 이유", # 👈 이런 식의 필드 추가
            "url": exhibition['url'] if exhibition else "#"
        },
        "cafe": {
            "name": cafe['name'],
            "address": cafe['address'],
            "desc": "아띠의 카페 추천 이유",
            "url": cafe['url']
        }
    }
}