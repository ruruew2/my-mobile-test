from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time

def crawl_instagram_hashtag(tag="서울전시회"):
    print(f"🚀 인스타그램 #{tag} 크롤링 시작...")
    
    options = webdriver.ChromeOptions()
    # options.add_argument("headless") # 인스타는 headless 쓰면 차단 잘 당함. 켜두세요.
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    # 1. 해시태그 페이지 접속
    url = f"https://www.instagram.com/explore/tags/{tag}/"
    driver.get(url)
    time.sleep(5) # 로딩 기다리기 (필수!)

    results = []
    
    # 2. 게시물 링크 찾기 (a 태그 중에 href가 '/p/'로 시작하는 것)
    posts = driver.find_elements(By.XPATH, "//a[contains(@href, '/p/')]")

    # 상위 5개만 긁어오기 (너무 많이 하면 로그인 창 뜸)
    for post in posts[:5]: 
        try:
            link = post.get_attribute("href")
            
            # 이미지 URL 찾기 (img 태그)
            img_tag = post.find_element(By.TAG_NAME, "img")
            img_url = img_tag.get_attribute("src")
            caption = img_tag.get_attribute("alt") # 보통 alt에 본문 내용이 있음
            
            data = {
                "link": link,
                "image": img_url,
                "desc": caption[:100] if caption else "설명 없음", # AI 분석용 텍스트
                "source": "Instagram"
            }
            results.append(data)
            print(f"✅ 인스타 수집: {link}")
            
        except Exception as e:
            continue

    driver.quit()
    return results