# ai_service.py
from openai import OpenAI
import os
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 1. 텍스트 -> 벡터 변환 (임베딩)
def get_embedding(text):
    text = text.replace("\n", " ")
    response = client.embeddings.create(input=[text], model="text-embedding-3-small")
    return response.data[0].embedding

# 2. 전시회 추천 로직
def recommend_exhibitions(user_tags, exhibition_list):
    """
    user_tags: "힙한 성수동 데이트"
    exhibition_list: 수집한 전시회 데이터 리스트
    """
    print(f"🤖 추천 분석 시작: {user_tags}")
    
    # 사용자 취향 벡터화
    user_vec = get_embedding(user_tags)
    
    scored_list = []
    for exh in exhibition_list:
        # 전시회 정보 벡터화 (제목+장소 텍스트 이용)
        # *실제 서비스에선 DB에 미리 벡터값을 저장해놔야 빠름*
        exh_vec = get_embedding(exh['desc'])
        
        # 유사도 계산
        score = cosine_similarity([user_vec], [exh_vec])[0][0]
        exh['score'] = score
        scored_list.append(exh)
    
    # 점수 높은 순 정렬 후 Top 3 반환
    scored_list.sort(key=lambda x: x['score'], reverse=True)
    return scored_list[:3]

# 3. AI 도슨트 (TTS)
def generate_docent_audio(text, style="kind"):
    print(f"🎤 오디오 생성 중... 스타일: {style}")
    
    # 페르소나 설정
    system_prompt = "너는 친절한 미술관 도슨트야."
    voice_model = "nova" # 여성톤 (kind)
    
    if style == "funny":
        system_prompt = "너는 아주 재밌고 유쾌한 친구 같은 도슨트야."
        voice_model = "onyx" # 남성톤
        
    # 대본 다듬기 (GPT)
    gpt_res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"이 작품 설명해줘: {text}"}
        ]
    )
    script = gpt_res.choices[0].message.content
    
    # 오디오 생성 (TTS)
    audio_res = client.audio.speech.create(
        model="tts-1",
        voice=voice_model,
        input=script
    )
    
    filename = f"docent_{style}.mp3"
    audio_res.stream_to_file(filename)
    return filename

# 4. 데이트 코스 짜주기
def generate_course_text(exhibition, location, who):
    prompt = f"""
    메인 전시: {exhibition}
    위치: {location}
    동행: {who}
    
    위 정보를 바탕으로 {who}과 함께하기 좋은 '전시 나들이 코스'를 추천해줘.
    [식사] -> [전시 관람] -> [카페] 순서로 실제 {location}의 맛집을 포함해서 작성해줘.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content