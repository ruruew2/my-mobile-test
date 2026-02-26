import urllib.request
import json
import os
import urllib.parse
from dotenv import load_dotenv
from utils import get_coordinates 

load_dotenv()

# ==========================================
# 🏠 1번 집: 네이버 개발자 센터 (검색용 키)
# ==========================================
SEARCH_ID = os.getenv("NAVER_SEARCH_ID")
SEARCH_SECRET = os.getenv("NAVER_SEARCH_SECRET")

def fetch_naver_places(keyword="성수 팝업스토어", display=5):
    results = []
    
    if not SEARCH_ID: 
        print("❌ 에러: .env 파일에 'NAVER_SEARCH_ID'가 없습니다.")
        return results

    try:
        # 1. 네이버 로컬 검색 API 호출 (검색어 인코딩)
        encText = urllib.parse.quote(keyword)
        url = f"https://openapi.naver.com/v1/search/local.json?query={encText}&display={display}&sort=random"
        
        request = urllib.request.Request(url)
        # 🚨 검색 API는 'X-Naver...' 헤더를 씁니다.
        request.add_header("X-Naver-Client-Id", SEARCH_ID)
        request.add_header("X-Naver-Client-Secret", SEARCH_SECRET)
        
        response = urllib.request.urlopen(request)
        rescode = response.getcode()

        if rescode == 200:
            response_body = response.read()
            data = json.loads(response_body.decode('utf-8'))
            items = data.get('items', [])
            
            print(f"🔍 '{keyword}' 검색 결과: {len(items)}개 발견")

            for item in items:
                # 2. 데이터 정제 (HTML 태그 제거 및 None 방지)
                raw_title = item.get('title', "")
                title = raw_title.replace('<b>','').replace('</b>','') if raw_title else "이름 없음"
                
                road_addr = item.get('roadAddress')
                jibun_addr = item.get('address')
                
                # 도로명 주소 우선, 없으면 지번 주소 사용
                address = road_addr if road_addr else jibun_addr

                if not address:
                    print(f"⚠️ 주소 없음 패스: {title}")
                    continue

                # 3. utils.py를 통해 좌표 변환 (여기서 Maps API가 사용됨)
                lat, lng = get_coordinates(address)
                
                # 주소로 못 찾으면 이름으로 재시도
                if lat is None:
                    lat, lng = get_coordinates(title)

                if lat and lng:
                    print(f"✅ 좌표 성공: {title} ({lat}, {lng})")
                    results.append({
                        "title": title,
                        "address": address,
                        "lat": lat,
                        "lng": lng,
                        "category": item.get('category', '기타')
                    })
                else:
                    print(f"❌ 좌표 실패: {title}")
        else:
            print(f"❌ 검색 API 에러 코드: {rescode}")

    except Exception as e:
        print(f"❌ 실행 중 치명적 에러: {e}")
    
    return results

if __name__ == "__main__":
    # 테스트 실행
    final_data = fetch_naver_places("성수 팝업스토어")
    print(f"\n✨ 최종 수집된 데이터: {len(final_data)}개")
    # print(final_data) # 데이터 내용 확인하려면 주석 해제