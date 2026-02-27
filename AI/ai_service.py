# ai_service.py
from openai import OpenAI
import os
import requests
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

KAKAO_API_KEY = os.getenv("KAKAO_API_KEY")          # 카카오 Local API 키 (Category 검색)
KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY") # 카카오 Local API 키 (Keyword 검색)

print("🚨🚨 파이썬이 읽은 키:", os.getenv("OPENAI_API_KEY"))

# ==========================================
# 1. 취향 태그 기반 전시회 추천 (초고속 매칭)
# ==========================================
def recommend_exhibitions(user_tags, exhibition_list):
    """
    user_tags: 리스트 형태 ["화려한", "몽환적인", "트렌디한"]
    exhibition_list: DB에서 가져온 전시/공연 데이터 리스트 [{'title': '...', 'hashtag': '화려한, 생생한'}, ...]
    """
    print(f"🤖 태그 매칭 추천 시작: 유저 취향 {user_tags}")

    user_set = set(user_tags or [])
    scored_list = []

    for exh in exhibition_list or []:
        db_tags_str = exh.get('hashtag') or ""
        exh_tags = set([t.strip() for t in db_tags_str.split(',') if t.strip()])

        match_count = len(user_set.intersection(exh_tags))
        exh['match_score'] = match_count
        scored_list.append(exh)

    scored_list.sort(key=lambda x: x.get('match_score', 0), reverse=True)
    return scored_list[:3]


# ==========================================
# 1-1. 다국어 AI 도슨트 (Vision -> Script -> TTS)
# ==========================================
def generate_multilingual_docent(image_url, lang="ko"):
    """
    image_url: 사용자가 찍은 작품 사진 URL
    lang: 'ko', 'en', 'ja', 'ch'
    """
    lang = (lang or "ko").strip().lower()
    print(f"🎤 AI 도슨트 생성 중... 언어: {lang} (스타일: Kind 고정)")

    # 1) 언어 명칭 매핑
    lang_map = {
        "ko": "Korean",
        "en": "English",
        "ja": "Japanese",
        "ch": "Chinese",
    }
    target_lang = lang_map.get(lang, "Korean")

    # 2) 언어별 user 지시문 (여기가 핵심!)
    user_prompt_map = {
        "ko": "이 작품 사진을 분석해서 제목, 작가, 그리고 작품의 의미를 포함한 도슨트 해설을 300자 내외로 작성해줘. 특수기호는 빼고 자연스러운 구어체로 써줘.",
        "en": "Analyze the artwork photo and write a docent-style explanation about 120 to 180 words. Include the title, artist, and meaning if identifiable. Avoid special characters. Use a natural spoken tone.",
        "ja": "この作品写真を分析し、タイトル、作家、作品の意味を含めたドーセント解説を作成してください。自然な口語体で、記号は使わないでください。",
        "ch": "请分析这张作品照片，撰写包含标题、作者及作品意义的讲解说明。使用自然口语，不要使用特殊符号。",
    }
    user_text = user_prompt_map.get(lang, user_prompt_map["ko"])

    # 3) 시스템 프롬프트
    system_prompt = f"""
You are a professional museum docent. Explain the artwork/photo in the provided image.
Make it engaging, friendly, and informative.

CRITICAL RULE:
Your entire response MUST be written ONLY in {target_lang}.
Do NOT mix languages. Do NOT use any language other than {target_lang}.
If the user message is in a different language, ignore that and still respond ONLY in {target_lang}.
""".strip()

    voice_model = "nova"

    try:
        # 4) Vision으로 스크립트 생성
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                },
            ],
            max_tokens=500,
        )

        script = (response.choices[0].message.content or "").strip()

        # 5) TTS 생성
        audio_res = client.audio.speech.create(
            model="tts-1",
            voice=voice_model,
            input=script,
        )

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
        "radius": 1000,
        "sort": "accuracy",
    }

    try:
        res = requests.get(url, headers=headers, params=params, timeout=5).json()
        if res.get("documents"):
            place = res["documents"][0]
            return {
                "name": place["place_name"],
                "url": place["place_url"],
                "distance": place["distance"],
            }
    except Exception as e:
        print(f"❌ 카카오 API 호출 실패: {e}")
    return None


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
        "size": 1,
    }

    try:
        res = requests.get(url, headers=headers, params=params, timeout=5)
        data = res.json()
        if data.get("documents"):
            place = data["documents"][0]
            return {
                "name": place["place_name"],
                "address": place.get("address_name") or place.get("road_address_name") or "",
                "url": place["place_url"],
                "lat": place["y"],
                "lng": place["x"],
            }
    except Exception as e:
        print(f"❌ 카카오 검색 에러 ({keyword}): {e}")
    return None


def generate_course_text_v3(destination, who, exhibition):
    if exhibition:
        exh_info = f"전시 제목: {exhibition.get('title')}, 장소: {exhibition.get('place_name')}"
        search_base = exhibition.get("place_name") or destination
    else:
        exh_info = "현재 해당 지역에 등록된 특정 전시회가 없음"
        search_base = destination

    restaurant = get_kakao_place_by_keyword(f"{search_base} 맛집", "FD6")
    cafe = get_kakao_place_by_keyword(f"{search_base} 카페", "CE7")

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
""".strip()

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
    )

    story = (response.choices[0].message.content or "").strip()

    # None 방어 (restaurant/cafe가 None이면 접근하면 터짐)
    safe_rest = restaurant or {"name": "정보 없음", "address": "", "url": "#"}
    safe_cafe = cafe or {"name": "정보 없음", "address": "", "url": "#"}
    safe_exh = exhibition or {"title": "정보 없음", "place_name": "정보 없음", "url": "#"}

    return {
        "story": story,
        "places": {
            "restaurant": {
                "name": safe_rest["name"],
                "address": safe_rest.get("address", ""),
                "desc": "아띠의 식당 추천 이유",
                "url": safe_rest.get("url", "#"),
            },
            "exhibition": {
                "name": safe_exh.get("title", "정보 없음"),
                "address": safe_exh.get("place_name", "정보 없음"),
                "desc": "아띠의 전시 / 공연 추천 이유",
                "url": safe_exh.get("url", "#"),
            },
            "cafe": {
                "name": safe_cafe["name"],
                "address": safe_cafe.get("address", ""),
                "desc": "아띠의 카페 추천 이유",
                "url": safe_cafe.get("url", "#"),
            },
        },
    }