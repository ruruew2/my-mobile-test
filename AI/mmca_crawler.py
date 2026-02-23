import requests
from bs4 import BeautifulSoup

def crawl_mmca():
    print("🚀 국립현대미술관(MMCA) 크롤링 시작...")
    
    # 현재 전시 목록 페이지
    url = "https://www.mmca.go.kr/exhibitions/progressList.do"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    results = []
    
    # 전시 리스트 박스 찾기
    list_box = soup.select(".listBox")
    
    for item in list_box:
        try:
            title = item.select_one(".title").text.strip()
            period = item.select_one(".period").text.strip()
            img_url = "https://www.mmca.go.kr" + item.select_one("img")['src']
            link = "https://www.mmca.go.kr" + item.select_one("a")['href']
            
            data = {
                "title": title,
                "period": period,
                "place": "국립현대미술관",
                "image": img_url,
                "link": link,
                "source": "MMCA"
            }
            results.append(data)
            print(f"✅ MMCA 수집: {title}")
            
        except:
            continue
            
    return results