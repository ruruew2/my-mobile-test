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

def generate_docent_audio(title, text, style="kind"):
    print(f"🎤 AI 도슨트 대본 및 오디오 생성 중... 스타일: {style}")
    
    # 1. 타겟 고객별 페르소나 및 보이스 매핑
    if style == "kind":
        system_prompt = "너는 국립현대미술관의 차분하고 우아한 10년 차 수석 도슨트야. 관람객에게 존댓말로 부드럽게 설명해줘."
        voice_model = "nova"     # 여성톤 (차분함)
    elif style == "funny":
        system_prompt = "너는 유쾌하고 에너지 넘치는 예술가 친구야. 딱딱한 해설보다는 '비하인드 스토리'나 '가십' 위주로 친근하게 반말로 설명해줘."
        voice_model = "onyx"     # 남성톤 (단단함)
    elif style == "kids":
        system_prompt = "너는 유치원 선생님이야. 7살 아이가 이해할 수 있게 어려운 단어는 빼고 동화책을 읽어주듯 설명해줘."
        voice_model = "shimmer"  # 여성톤 (밝고 명랑함)
    else:
        system_prompt = "너는 객관적이고 정확한 예술 평론가야."
        voice_model = "alloy"    # 중성톤
        
    # 2. TTS에 최적화된 대본 작성을 위한 프롬프트 엔지니어링 🚨(매우 중요)
    gpt_prompt = f"""
    작품(또는 전시)명: {title}
    기본 설명: {text}
    
    위 정보를 바탕으로 관람객이 이어폰으로 들었을 때 가장 자연스러운 '오디오 가이드 대본'을 300~400자 내외로 작성해줘.
    
    [절대 지켜야 할 조건]
    1. 귀로 듣는 문장이므로 *, #, -, 숫자가 포함된 리스트 등 특수기호는 절대 쓰지 마. (TTS가 기호를 그대로 읽어버림)
    2. 시각장애인이나 스마트폰 화면을 보지 않는 사람도 머릿속에 그림이 그려지도록 시각적으로 묘사해줘.
    3. 숨을 쉴 수 있게 문장을 너무 길지 않게 끊어주고, 자연스러운 접속사를 써줘.
    """
    
    try:
        # 3. 대본 생성 (GPT-4o-mini)
        gpt_res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": gpt_prompt}
            ]
        )
        script = gpt_res.choices[0].message.content.strip()
        print(f"📝 생성된 대본: {script[:50]}...")
        
        # 4. 오디오 생성 (OpenAI TTS)
        audio_res = client.audio.speech.create(
            model="tts-1", # 고음질을 원하면 "tts-1-hd" 사용
            voice=voice_model,
            input=script
        )
        
        # 🚨 최신 OpenAI SDK 반영: stream_to_file은 지원 중단됨
        filename = f"audio/ docent_{title}_{style}.mp3"
        audio_res.write_to_file(filename) 
        print(f"🎧 오디오 파일 저장 완료: {filename}")
        
        # 프론트엔드에서 재생할 파일명과, 화면에 띄울 자막(대본)을 같이 리턴
        return filename, script
        
    except Exception as e:
        print(f"❌ 도슨트 생성 중 에러 발생: {e}")
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
def generate_course_text_v3(destination, who, exhibition=None):
    """
    destination: '성수', '한남동' 등 지역명
    who: '연인', '아이', '부모님' 등 동행자
    exhibition: DB에서 찾은 전시 데이터 (딕셔너리)
    """
    print(f"🗺️ {destination}에서 {who}와의 코스 기획 중...")

    # 1. 전시장 유무에 따른 식당/카페 검색 기준 설정
    if exhibition:
        # 전시회가 있으면 해당 전시장 주변으로 검색 (위경도 기반 대신 장소명+지역으로 검색)
        search_base = f"{exhibition['place_name']}"
        exh_title = exhibition['title']
        # 전시회 카카오맵 링크 생성 (DB에 없을 경우 대비)
        exhibition['map_url'] = f"https://map.kakao.com/link/search/{exhibition['place_name']} {exhibition['title']}"
    else:
        # 전시회가 없으면 사용자가 입력한 지역명 기준으로 검색
        search_base = destination
        exh_title = f"{destination} 인근의 멋진 거리"

    # 2. 실제 맛집과 카페 검색
    restaurant = get_kakao_place_by_keyword(f"{search_base} 맛ny집", "FD6")
    cafe = get_kakao_place_by_keyword(f"{search_base} 카페", "CE7")

    rest_name = restaurant['name'] if restaurant else "현지 인기 식당"
    cafe_name = cafe['name'] if cafe else "감성 카페"

    # 3. GPT 스토리텔링 생성
    prompt = f"""
    당신은 센스 넘치는 여행 가이드입니다. 
    사용자가 지금 '{destination}' 지역에 '{who}'와 함께 나들이를 가려고 합니다.
    
    [방문 예정 장소]
    - 메인: {exh_title} (전시/공연)
    - 식사: {rest_name}
    - 디저트: {cafe_name}
    
    이 세 곳을 엮어서 {who}와 함께하기 좋은 완벽한 반나절 코스를 200~300자 내외로 설명해줘.
    - {who}의 특성(예: 연인이면 로맨틱, 아이면 활동적, 부모님이면 편안함)을 반영한 다정한 말투로 쓸 것.
    - "먼저 {rest_name}에서 기분 좋게 식사하고..."와 같이 자연스러운 흐름으로 작성해줘.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    story = response.choices[0].message.content.strip()

    # 4. 프론트엔드가 쓰기 좋게 최종 결과 반환
    return {
        "story": story,
        "exhibition": exhibition,
        "places": {
            "restaurant": restaurant,
            "cafe": cafe
        }
    }