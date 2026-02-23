from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
import random

def crawl_naver_exhibitions():
    print("🚀 네이버 크롤링 시작...")
    
    # 1. 브라우저 옵션 설정 (사람처럼 보이기)
    options = webdriver.ChromeOptions()
    # options.add_argument("headless") # 테스트할 땐 주석 처리 (화면 보면서 하세요)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    # 2. 네이버 '서울전시회' 검색 결과 접속
    url = "https://m.search.naver.com/search.naver?query=서울전시회"
    driver.get(url)
    time.sleep(2)

    # 3. 스크롤 내리기 (데이터 더 불러오기)
    for _ in range(3):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)

    results = []
    
    # 4. 요소 찾기 (네이버 클래스명은 자주 바뀌므로 주의!)
    # 보통 카드 형태의 리스트는 'list_item' 같은 클래스를 가짐
    items = driver.find_elements(By.CSS_SELECTOR, ".list_item") 

    for item in items:
        try:
            # 제목
            title = item.find_element(By.CSS_SELECTOR, ".title").text
            # 장소, 기간 등은 보통 그 아래 span이나 div에 있음
            # (네이버 구조에 따라 유연하게 대처 필요)
            info_text = item.text.replace("\n", " ")
            
            # 이미지 (있으면 가져오기)
            try:
                img = item.find_element(By.TAG_NAME, "img").get_attribute("src")
            except:
                img = ""

            data = {
                "title": title,
                "desc": info_text[:50], # 텍스트 앞부분만 요약으로 사용
                "image": img,
                "source": "Naver"
            }
            results.append(data)
            print(f"✅ 수집: {title}")
            
        except Exception:
            continue

    driver.quit()
    return results

if __name__ == "__main__":
    print(crawl_naver_exhibitions())