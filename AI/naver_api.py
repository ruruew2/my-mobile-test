import urllib.request
import json
import os
import datetime
from dotenv import load_dotenv

# .env 파일 로딩
load_dotenv()
CLIENT_ID = os.getenv("NAVER_SEARCH_ID")
CLIENT_SECRET = os.getenv("NAVER_SEARCH_SECRET")

def search_naver_blog(keyword, display=5):
    """
    네이버 블로그에서 키워드로 검색하여 결과를 반환합니다.
    :param keyword: 검색어 (예: '서울 전시회 추천')
    :param display: 검색 결과 개수 (기본 5개)
    """
    if not CLIENT_ID or not CLIENT_SECRET:
        print("❌ 네이버 API 키가 없습니다. .env 파일을 확인하세요.")
        return []

    print(f"🚀 네이버 블로그 검색 시작: '{keyword}'...")
    
    # 검색어 인코딩
    encText = urllib.parse.quote(keyword)
    
    # API 요청 URL (JSON 반환)
    # sort=sim (정확도순), sort=date (날짜순)
    url = f"https://openapi.naver.com/v1/search/blog?query={encText}&display={display}&sort=sim"

    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", CLIENT_ID)
    request.add_header("X-Naver-Client-Secret", CLIENT_SECRET)

    try:
        response = urllib.request.urlopen(request)
        rescode = response.getcode()

        if rescode == 200:
            response_body = response.read()
            data = json.loads(response_body.decode('utf-8'))
            
            results = []
            for item in data['items']:
                # HTML 태그(<b> 등) 제거 및 날짜 포맷팅
                title = item['title'].replace('<b>', '').replace('</b>', '').replace('&quot;', '"')
                description = item['description'].replace('<b>', '').replace('</b>', '').replace('&quot;', '"')
                
                # 날짜 변환 (YYYYMMDD -> YYYY-MM-DD)
                postdate = item['postdate']
                formatted_date = f"{postdate[:4]}-{postdate[4:6]}-{postdate[6:]}"

                results.append({
                    "title": title,
                    "content": description, # 본문 요약
                    "link": item['link'],   # 블로그 글 링크
                    "date": formatted_date,
                    "blogger": item['bloggername'],
                    "source": "Naver Blog"
                })
            
            print(f"✅ 블로그 검색결과 {len(results)}개 수집 완료!")
            return results
        else:
            print(f"❌ 네이버 API 에러 코드: {rescode}")
            return []
            
    except Exception as e:
        print(f"❌ 검색 실패: {e}")
        return []

if __name__ == "__main__":
    # 테스트 실행
    search_naver_blog("서울 2월 전시회 추천")