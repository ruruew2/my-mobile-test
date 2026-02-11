import requests
import xml.etree.ElementTree as ET

def fetch_interpark_ranking():
    print("🚀 인터파크 랭킹 데이터(XML) 수집 시작...")
    
    # 1. 인터파크 랭킹 XML 주소 (전시/행사: cate=Eve)
    url = "http://ticket.interpark.com/Xml/Prd/PrdRanking.xml"
    params = {'cate': 'Eve'} # 전시 카테고리
    
    try:
        response = requests.get(url, params=params)
        
        # 인코딩 처리 (인터파크는 옛날 방식이라 가끔 깨짐 방지)
        response.encoding = 'euc-kr' # 또는 'utf-8', 상황에 맞춰 자동 감지됨
        
        # 2. XML 파싱
        root = ET.fromstring(response.text)
        results = []
        
        # 3. 데이터 추출
        # 구조: <Warning> -> <Result> -> <Item> 반복
        for item in root.findall('.//Item'):
            try:
                # 데이터 꺼내기
                place = item.find('Place').text
                exclude_keywords = ["부산", "대구", "인천", "광주", "대전", "울산", "경기", "창원", "성남"]
                if any(city in place for city in exclude_keywords):
                    continue
                rank = item.find('Rank').text           # 순위
                title = item.find('PrdName').text       # 전시명
                place = item.find('Place').text         # 장소
                start_date = item.find('StartDate').text # 시작일
                end_date = item.find('EndDate').text      # 종료일
                poster = item.find('Poster').text       # 포스터 URL
                prd_url = item.find('DetailUrl').text    # 예매 상세주소
                
                # 기간 포맷 합치기
                period = f"{start_date} ~ {end_date}"
                
                data = {
                    "rank": rank,
                    "title": title.strip(),
                    "place": place.strip(),
                    "period": period,
                    "image": poster,
                    "link": prd_url,
                    "source": "Interpark_API"
                }
                results.append(data)
                
            except AttributeError:
                continue

        print(f"✅ 수집 완료: {len(results)}건 (API 사용)")
        return results

    except Exception as e:
        print(f"❌ 인터파크 API 에러: {e}")
        return []

# 테스트 실행
if __name__ == "__main__":
    data = fetch_interpark_ranking()
    for d in data[:5]: # 5개만 출력
        print(d)