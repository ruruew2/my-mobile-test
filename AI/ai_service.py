# ai_service.py
from openai import OpenAI
import os
import requests
from dotenv import load_dotenv
import re
from numpy import random


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
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    # 🚨 꼭! REST API 키인지 확인하세요
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"query": keyword, "category_group_code": category_code, "size": 1}
    
    try:
        res = requests.get(url, headers=headers, params=params)
        data = res.json()
        
        # 🧐 CCTV: 카카오가 뭐라고 대답하는지 터미널에 찍어봅니다.
        if res.status_code != 200:
            print(f"❌ 카카오 API 호출 실패! 상태코드: {res.status_code}, 사유: {data}")
            return None

        if data.get('documents'):
            place = data['documents'][0]
            return {
                "name": place['place_name'],
                "address": place['address_name'],
                "url": place['place_url']
            }
        else:
            print(f"⚠️ '{keyword}' 검색 결과가 카카오에 없습니다.")
    except Exception as e:
        print(f"❌ 카카오 통신 에러: {e}")
    return None

# 2. 지역 & 동행자 기반 코스 생성 로직 (전시회 포함)
def get_kakao_place_by_keyword(keyword, category_code):
    """
    keyword: 검색어 (예: '성수 맛집')
    category_code: FD6(식당), CE7(카페)
    """
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {
        "query": keyword,
        "category_group_code": category_code,
        "size": 10  # 가장 연관성 높은 1곳만 선정
    }
    
    try:
        res = requests.get(url, headers=headers, params=params)
        data = res.json()
        if data.get('documents'):
            # 🚨 검색 결과 중 하나를 랜덤으로 선택 (맨날 대성갈비 안 나오게!)
            place = random.choice(data['documents'])
            return {
                "name": place['place_name'],
                "address": place['address_name'],
                "url": place['place_url']
            }
    except: return None
    return None

# 2. 지역 & 동행자 기반 코스 생성 로직 (전시회 포함)
import json

# 1. 이상한 동네로 안 튀게 카카오 검색 로직 수정
def get_kakao_place_by_keyword(keyword, category_code):
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    # 🚨 키워드 장난 금지! 대신 15개를 가져와서 최상위 5개 중 랜덤으로 뽑습니다.
    params = {"query": keyword, "category_group_code": category_code, "size": 15, "sort": "accuracy"}
    
    try:
        res = requests.get(url, headers=headers, params=params)
        data = res.json()
        if data.get('documents'):
            top_places = data['documents'][:5] # 가장 정확도 높은 5개
            place = random.choice(top_places)  # 그 중에서 1개 랜덤 픽!
            return {
                "name": place['place_name'],
                "url": place['place_url']
            }
    except: return None
    return None

# 2. 코스 생성 로직 업그레이드
def generate_course_text_v3(destination, who, exhibition_db=None):
    # '로컬' 같은 단어 빼고 정직하게 검색!
    restaurant = get_kakao_place_by_keyword(f"{destination} 맛집", "FD6")
    cafe = get_kakao_place_by_keyword(f"{destination} 카페", "CE7")
    
    res_name = restaurant['name'] if restaurant else "주변 맛집"
    cafe_name = cafe['name'] if cafe else "주변 카페"
    
    if exhibition_db:
        exh_name = exhibition_db.get('title')
        exh_info = f"{exh_name}"
    else:
        exh_name = f"{destination} 핫플레이스"
        exh_info = f"{destination}에서 가장 인기 있는 갤러리나 복합문화공간"

    # 🚨 AI에게 '각 장소별 한줄평'을 JSON으로 달라고 멱살 잡기!
    prompt = f"""
    당신은 {destination} 전문 가이드입니다. {who}와 가기 좋은 코스를 짰습니다.
    1. 전시: {exh_info}
    2. 식당: {res_name}
    3. 카페: {cafe_name}
    
    위 장소들에 대해 아래 JSON 형식으로만 딱 떨어지게 답변하세요.
    {{
        "story": "오늘의 전체 코스 테마를 1줄로 요약",
        "exh_desc": "이 전시(또는 공간)를 첫 번째 코스로 추천하는 이유 1줄",
        "res_desc": "이 식당을 추천하는 다정한 이유 1줄",
        "cafe_desc": "이 카페에서 어떤 여유를 즐기면 좋을지 1줄"
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" }, # 무조건 JSON으로 대답하게 강제
            messages=[{"role": "user", "content": prompt}]
        )
        ai_data = json.loads(response.choices[0].message.content)
    except:
        # 혹시 AI가 뻗어도 에러 안 나게 기본값 세팅
        ai_data = f"""
    당신은 {destination} 지역을 꿰뚫고 있는 전문 큐레이터이자 맛집 탐험가입니다.
    아래 선택된 장소들에 대한 실제 정보(시그니처 메뉴, 공간 특징, 유명한 이유 등)를 바탕으로, {who}와(과) 함께 가는 유저를 위해 구체적이고 매력적인 설명을 작성해주세요.

    [선택된 코스 장소]
    1. 전시/문화공간: {exh_info}
    2. 추천 식당: {res_name}
    3. 추천 카페: {cafe_name}
    
    [작성 지침 - 매우 중요]
    단순한 인사말이나 뻔한 소리는 절대 하지 마세요. 각 장소마다 아래의 '구체적인 정보'를 반드시 포함해서 2~3문장으로 자세히 설명해야 합니다.
    - 전시: 어떤 주제의 전시(공간)인지, 관람 포인트나 매력은 무엇인지.
    - 식당: 이 식당에서 가장 유명한 대표 메뉴는 무엇인지, 분위기나 맛의 특징은 어떤지.
    - 카페: 이 카페의 시그니처 디저트나 음료는 무엇인지, 인테리어나 뷰 등 공간이 주는 특별함은 무엇인지.

    반드시 아래 JSON 형식에 맞춰서 답변하세요.
    {{
        "story": "{destination}에서 {who}와 함께 즐기는 완벽한 코스 테마를 매력적으로 소개 (2문장)",
        "exh_comment": "전시/공간에 대한 구체적인 설명과 관람 포인트 (2~3문장)",
        "res_comment": "식당의 시그니처 메뉴와 유명한 이유, 분위기 설명 (2~3문장)",
        "cafe_comment": "카페의 인기 메뉴, 인테리어 특징, 추천 이유 (2~3문장)"
    }}
    """

    return {
        "story": ai_data["story"],
        "places": {
            "exhibition": {
                "name": exh_name,
                "desc": ai_data["exh_desc"]
            },
            "restaurant": {
                "name": res_name,
                "desc": ai_data["res_desc"],
                "url": restaurant['url'] if restaurant else "#"
            },
            "cafe": {
                "name": cafe_name,
                "desc": ai_data["cafe_desc"],
                "url": cafe['url'] if cafe else "#"
            }
        }
    }