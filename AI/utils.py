import requests
import os
from dotenv import load_dotenv

load_dotenv()
KAKAO_API_KEY = os.getenv("KAKAO_REST_API_KEY") # .env에 카카오 키 있는지 확인!

def get_coordinates(query):
    """
    장소 이름이나 주소를 넣으면 카카오 API를 통해 좌표(lat, lng)를 반환합니다.
    """
    if not query:
        return None, None

    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    
    # 1. 주소로 검색 시도
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    try:
        response = requests.get(url, headers=headers, params={"query": query})
        documents = response.json().get('documents')

        if documents:
            x = float(documents[0]['x']) # 경도 (lng)
            y = float(documents[0]['y']) # 위도 (lat)
            return y, x
    except:
        pass

    # 2. 주소 검색 실패 시, 키워드(장소명)로 재검색 시도
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    try:
        response = requests.get(url, headers=headers, params={"query": query})
        documents = response.json().get('documents')

        if documents:
            x = float(documents[0]['x'])
            y = float(documents[0]['y'])
            return y, x
    except:
        return None, None # 정말 못 찾으면 None 반환

    return None, None