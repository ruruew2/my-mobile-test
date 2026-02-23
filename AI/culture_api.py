import requests
import xml.etree.ElementTree as ET
import os
from dotenv import load_dotenv

load_dotenv()
CULTURE_API_KEY = os.getenv("CULTURE_API_KEY") # .env에 키 추가 필요!

def fetch_culture_portal_exhibitions():
    print("🚀 문화포털(미술관/박물관) 데이터 수집 시작...")
    
    # 1. URL 설정 (기간별 공연/전시 목록 조회)
    url = "http://www.culture.go.kr/openapi/rest/publicperformancedisplays/realm"
    
    params = {
        'serviceKey': CULTURE_API_KEY,
        'cPage': 1,
        'rows': 20,          # 20개만 가져오기 (테스트용)
        'from': '20240101',  # 시작일 (YYYYMMDD)
        'to': '20241231'     # 종료일
    }
    
    try:
        response = requests.get(url, params=params)
        
        # 2. XML 파싱
        root = ET.fromstring(response.text)
        results = []
        
        for item in root.findall('.//perforList'):
            try:
                # 3. 데이터 추출
                area = item.find('area').text
                if area != "서울": 
                    continue
                title = item.find('title').text
                place = item.find('place').text
                start_date = item.find('startDate').text
                end_date = item.find('endDate').text
                img_url = item.find('imgUrl').text
                detail_link = item.find('url').text
                gps_x = item.find('gpsX').text # 경도 (lng)
                gps_y = item.find('gpsY').text # 위도 (lat)
                
                # 문화포털은 좌표를 줘서 아주 편합니다!
                data = {
                    "title": title,
                    "place": place,
                    "period": f"{start_date} ~ {end_date}",
                    "image": img_url,
                    "link": detail_link,
                    "lat": float(gps_y) if gps_y else None,
                    "lng": float(gps_x) if gps_x else None,
                    "source": "Culture_Portal"
                }
                results.append(data)
                
            except Exception:
                continue
                
        print(f"✅ 문화포털 데이터 {len(results)}개 수집 완료")
        return results

    except Exception as e:
        print(f"❌ 문화포털 API 에러: {e}")
        return []

# 테스트
if __name__ == "__main__":
    data = fetch_culture_portal_exhibitions()
    print(data[:3])