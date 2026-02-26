from openai import OpenAI
import os
import requests
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경 변수 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# KAKAO_REST_API_KEY가 코스 생성에 사용되므로 이를 우선적으로 확인
KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY") or os.getenv("KAKAO_API_KEY")

# [디버깅] 서버 시작 시 키 로드 상태 확인
if OPENAI_API_KEY:
    print(f"✅ OpenAI API Key 로드 성공: {OPENAI_API_KEY[:10]}...")
else:
    print("❌ OpenAI API Key 로드 실패! .env 파일을 확인하세요.")

if KAKAO_REST_API_KEY:
    print(f"✅ Kakao API Key 로드 성공: {KAKAO_REST_API_KEY[:10]}...")
else:
    print("❌ Kakao API Key 로드 실패! .env 파일을 확인하세요.")

# OpenAI 클라이언트 초기화 (단 한 번만 수행)
client = OpenAI(api_key=OPENAI_API_KEY)

# ==========================================
# 1. 취향 태그 기반 전시회 추천
# ==========================================
def recommend_exhibitions(user_tags, exhibition_list):
    print(f"🤖 태그 매칭 추천 시작: 유저 취향 {user_tags}")
    
    user_set = set(user_tags)
    scored_list = []
    
    for exh in exhibition_list:
        db_tags_str = exh.get('hashtag') or ""
        exh_tags = set([t.strip() for t in db_tags_str.split(',') if t.strip()])
        
        # 교집합 계산
        match_count = len(user_set.intersection(exh_tags))
        exh['match_score'] = match_count
        scored_list.append(exh)
    
    # 점수 높은 순 정렬
    scored_list.sort(key=lambda x: x['match_score'], reverse=True)
    return scored_list[:3]

# ==========================================
# 2. AI 도슨트 오디오 생성
# ==========================================
def generate_docent_audio(title, text, style="kind"):
    print(f"🎤 AI 도슨트 생성 시작: {title} ({style})")
    
    if style == "kind":
        system_prompt = "너는 국립현대미술관의 차분하고 우아한 수석 도슨트야. 존댓말로 부드럽게 설명해줘."
        voice_model = "nova"
    elif style == "funny":
        system_prompt = "너는 유쾌한 예술가 친구야. 비하인드 스토리 위주로 반말로 설명해줘."
        voice_model = "onyx"
    elif style == "kids":
        system_prompt = "너는 유치원 선생님이야. 아이가 이해할 수 있게 동화책 읽듯 설명해줘."
        voice_model = "shimmer"
    else:
        system_prompt = "너는 객관적인 예술 평론가야."
        voice_model = "alloy"
        
    gpt_prompt = f"작품명: {title}\n정보: {text}\n위 정보를 바탕으로 오디오 가이드 대본을 300자 내외로 작성해줘. 특수기호는 제외해줘."
    
    try:
        # 대본 생성
        gpt_res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": gpt_prompt}
            ]
        )
        script = gpt_res.choices[0].message.content.strip()
        
        # 오디오 생성
        audio_res = client.audio.speech.create(
            model="tts-1",
            voice=voice_model,
            input=script
        )
        
        # 파일 저장
        filename = f"audio/docent_{title}_{style}.mp3"
        audio_res.write_to_file(filename) 
        return filename, script
        
    except Exception as e:
        print(f"❌ 도슨트 생성 에러: {e}")
        return None, None

# ==========================================
# 3. 카카오 키워드 검색 (맛집, 카페)
# ==========================================
def get_kakao_place_by_keyword(keyword, category_code):
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": keyword, "category_group_code": category_code, "size": 1}
    
    try:
        res = requests.get(url, headers=headers, params=params, timeout=5)
        data = res.json()
        if data.get('documents'):
            place = data['documents'][0]
            return {
                "name": place['place_name'],
                "address": place['address_name'],
                "url": place['place_url'],
                "lat": place['y'],
                "lng": place['x']
            }
    except Exception as e:
        print(f"❌ 카카오 API 에러 ({keyword}): {e}")
    return None

# ==========================================
# 4. 나들이 코스 스토리텔링 생성
# ==========================================
def generate_course_text_v3(destination, who, exhibition=None):
    print(f"🗺️ 코스 설계 중: {destination} / {who}")

    # 검색 기준 설정
    if exhibition:
        search_base = exhibition['place_name']
        exh_title = exhibition['title']
    else:
        search_base = destination
        exh_title = f"{destination} 인근 전시"

    # 실제 장소 검색
    restaurant = get_kakao_place_by_keyword(f"{search_base} 맛집", "FD6")
    cafe = get_kakao_place_by_keyword(f"{search_base} 카페", "CE7")

    rest_name = restaurant['name'] if restaurant else "주변 인기 식당"
    cafe_name = cafe['name'] if cafe else "감성 카페"

    # GPT 스토리텔링
    prompt = f"""
    당신은 여행 가이드입니다. {destination}에서 {who}와 함께하는 반나절 코스를 설명해줘.
    - 메인: {exh_title}
    - 식사: {rest_name}
    - 디저트: {cafe_name}
    {who}의 성향에 맞춰 다정한 말투로 250자 내외로 써줘.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        story = response.choices[0].message.content.strip()
        
        return {
            "story": story,
            "exhibition": exhibition,
            "places": {
                "restaurant": restaurant,
                "cafe": cafe
            }
        }
    except Exception as e:
        print(f"❌ 코스 스토리 생성 에러: {e}")
        return {
            "story": "죄송합니다. 코스 설명을 생성하는 중에 문제가 발생했지만, 검색된 장소 정보를 알려드릴게요.",
            "exhibition": exhibition,
            "places": {"restaurant": restaurant, "cafe": cafe}
        }