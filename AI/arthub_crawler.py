#arthub_crawler.py
import requests
from bs4 import BeautifulSoup
import time

def get_arthub_detail(link):
    """
    상세 페이지 URL로 접속해서 가격과 본문 내용을 긁어오는 함수
    """
    try:
        res = requests.get(link)
        res.encoding = 'euc-kr'
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # 아트허브 상세 페이지 구조 분석 (개발자 도구 F12 기반)
        # 본문 내용은 보통 'board_view_contents' 클래스 안에 있음
        content_div = soup.select_one(".board_view_contents")
        
        if content_div:
            # HTML 태그 다 떼고 순수 텍스트만 가져오기
            full_text = content_div.get_text(separator=" ", strip=True)
            # 너무 기니까 앞부분 300자만 (AI 요약용)
            return full_text[:500] 
        else:
            return "상세 내용을 불러올 수 없습니다."
            
    except Exception:
        return "크롤링 실패"

def crawl_arthub():
    url = "https://www.arthub.co.kr/sub01/board03_list.htm"
    params = {'k_area': 'A'} 
    response = requests.get(url, params=params)
    response.encoding = 'euc-kr'
    soup = BeautifulSoup(response.text, 'html.parser')
    
    items = soup.select(".list_type_01") 
    results = []

    print(f"🔍 아트허브 크롤링 시작 ({len(items)}개)...")

    for item in items:
        try:
            title_tag = item.select_one(".subject a")
            title = title_tag.text.strip()
            link = "https://www.arthub.co.kr/sub01/" + title_tag['href']
            
            # [핵심] 상세 페이지로 들어가서 내용 긁어오기
            print(f"  > 상세 긁는 중: {title}...")
            detail_desc = get_arthub_detail(link)
            
            # 가격 정보는 아트허브 목록엔 잘 없고 상세 본문에 포함된 경우가 많음.
            # 정형화하기 어려우므로 '무료/유료'는 본문 분석이나 별도 로직 필요.
            # 일단은 '별도 문의'로 처리하거나 본문에서 '원'을 찾는 로직 추가 가능.
            
            data = {
                "title": title,
                "place": item.select_one(".date").text.split('|')[-1].strip(),
                "period": item.select_one(".date").text.split('|')[0].strip(),
                "image": item.select_one(".img_box img")['src'],
                "price": "상세페이지 참조", # 아트허브는 가격 칸이 따로 없음
                "desc": detail_desc,        # 본문 내용 (AI 추천에 사용)
                "link": link
            }
            results.append(data)
            time.sleep(0.5) # 차단 방지용 딜레이
            
        except Exception as e:
            continue
            
    return results