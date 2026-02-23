import requests
import os
from dotenv import load_dotenv

load_dotenv()
SEOUL_API_KEY = os.getenv("SEOUL_API_KEY")

def fetch_seoul_events():
    print("🚀 서울시 공공데이터 수집 시작...")
    
    # 서울시 API 구조: http://openapi.seoul.go.kr:8088/{키}/{형식}/{서비스명}/{시작}/{끝}/
    url = f"http://openapi.seoul.go.kr:8088/{SEOUL_API_KEY}/json/culturalEventInfo/1/100/"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        events = []
        if 'culturalEventInfo' in data:
            for row in data['culturalEventInfo']['row']:
                # 필요한 정보만 쏙쏙 뽑기
                event = {
                    "title": row['TITLE'],
                    "place": row['PLACE'],
                    "period": f"{row['DATE']}", 
                    "image": row['MAIN_IMG'],
                    "link": row['ORG_LINK'],
                    "lat": row['LOT'], # 위도
                    "lng": row['LAT'], # 경도 (서울시가 가끔 반대로 줄 때가 있으니 확인 필요)
                    "source": "Seoul_City"
                }
                events.append(event)
                
        print(f"✅ 서울시 데이터 {len(events)}개 수집 완료")
        return events

    except Exception as e:
        print(f"❌ 서울시 API 에러: {e}")
        return []