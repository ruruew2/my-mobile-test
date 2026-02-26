import os
import base64
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

# 1. 취향 태그 기반 전시회 추천
def recommend_exhibitions(user_tags, exhibition_list):
    user_set = set(user_tags)
    scored_list = []
    for exh in exhibition_list:
        db_tags_str = exh.get('hashtag') or ""
        exh_tags = set([t.strip() for t in db_tags_str.split(',') if t.strip()])
        match_count = len(user_set.intersection(exh_tags))
        exh['match_score'] = match_count
        scored_list.append(exh)
    scored_list.sort(key=lambda x: x['match_score'], reverse=True)
    return scored_list[:3]

# 2. GPT-4o Vision 분석 + TTS 음성 생성
def generate_multilingual_docent(image_path, lang="ko"):
    try:
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        lang_map = {"ko": "Korean", "en": "English", "ja": "Japanese", "zh": "Chinese"}
        target_lang = lang_map.get(lang, "Korean")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"너는 우아한 수석 도슨트야. 모든 설명은 {target_lang}로, 다정하게 존댓말로 해줘."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 작품의 제목, 작가, 의미를 분석해서 300자 내외로 설명해줘. 특수문자는 빼줘."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ]
        )
        script = response.choices[0].message.content.strip()
        audio_res = client.audio.speech.create(model="tts-1", voice="nova", input=script)
        
        # 파일명 중복 방지를 위한 hash 사용
        audio_filename = f"audio/docent_{hash(script)}.mp3"
        audio_res.write_to_file(audio_filename)
        
        return audio_filename, script
    except Exception as e:
        print(f"❌ AI 서비스 에러: {e}")
        return None, None

# 3. 카카오 장소 검색 및 코스 생성
def get_kakao_place_by_keyword(keyword, category_code):
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": keyword, "category_group_code": category_code, "size": 1}
    try:
        res = requests.get(url, headers=headers, params=params).json()
        if res.get('documents'):
            place = res['documents'][0]
            return {"name": place['place_name'], "address": place['address_name'], "url": place['place_url']}
    except: return None
    return None

def generate_course_text_v3(destination, who, exhibition):
    search_base = exhibition['place_name'] if exhibition else destination
    restaurant = get_kakao_place_by_keyword(f"{search_base} 맛집", "FD6")
    cafe = get_kakao_place_by_keyword(f"{search_base} 카페", "CE7")
    
    prompt = f"지역:{destination}, 타겟:{who}, 전시:{exhibition['title'] if exhibition else '산책'}. 이 정보를 토대로 나들이 코스 스토리를 써줘."
    res = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
    
    return {
        "story": res.choices[0].message.content,
        "places": {
            "restaurant": restaurant or {"name": "근처 맛집", "address": "정보 없음", "url": "#"},
            "cafe": cafe or {"name": "근처 카페", "address": "정보 없음", "url": "#"},
            "exhibition": exhibition or {"title": "거리 산책", "place_name": destination, "url": "#"}
        }
    }