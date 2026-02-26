import requests
import xml.etree.ElementTree as ET
from database import get_connection
from datetime import datetime, timedelta
from openai import OpenAI
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import re
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import requests
import json

# 🔑 모든 인증키 한곳에 모으기
SEOUL_KEY = "425047666b63686139307a42745a4f"
KOPIS_KEY = "6d447b7564364fcfb1cf8d5820047c86" # 공연 수집용 인증키
KAKAO_KEY = "c820787a3c6dd400a475ae15a8446435" # 카카오 API 키 (좌표 확보용)
OPENAI_API_KEY = "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" # OpenAI API 키 (태그 생성용)

client = OpenAI(api_key=OPENAI_API_KEY)

def get_coords(place_name):
    """카카오 API를 이용해 장소명으로 좌표(위경도) 추출"""
    if not KAKAO_KEY: return 0, 0
    try:
        url = "https://dapi.kakao.com/v2/local/search/keyword.json"
        headers = {"Authorization": f"KakaoAK {KAKAO_KEY}"}
        res = requests.get(url, params={'query': place_name}, headers=headers, timeout=5).json()
        if res.get('documents'):
            doc = res['documents'][0]
            return float(doc['y']), float(doc['x'])
    except: pass
    return 0, 0

def clean_old_data(cursor):
    """1. 이미 종료된 행사 데이터 삭제"""
    print("🧹 [Step 1] 기간 만료 데이터 삭제 중...")
    today = datetime.now().strftime('%Y-%m-%d')
    sql = "DELETE FROM event WHERE end_date < %s"
    cursor.execute(sql, (today,))

def collect_seoul(cursor, conn):
    print("🏙️ [Step 2-1] 서울 데이터 싹쓸이 모드 가동 (최대치 수집)...")
    
    actual_key = SEOUL_KEY.strip() # 혹시 모를 공백 제거
    start_idx = 1
    end_idx = 1000  # 한 번에 1,000개씩 요청 가능
    total_saved = 0

    while True:
        url = f"http://openapi.seoul.go.kr:8088/{actual_key}/json/culturalEventInfo/{start_idx}/{end_idx}/"
        
        try:
            res = requests.get(url, timeout=15)
            data = res.json()
            
            if "culturalEventInfo" in data:
                events = data["culturalEventInfo"]["row"]
                # 더 이상 가져올 데이터가 없으면 탈출
                if not events:
                    break
                
                print(f"   📥 {start_idx} ~ {end_idx}번 데이터 분석 중...")
                
                for ev in events:
                    try:
                        title = ev.get('TITLE', '제목없음')
                        place = ev.get('PLACE', '장소미정')[:100]
                        area = ev.get('GUNAME', '서울')
                        s_date = ev.get('STRTDATE', '2026-01-01')[:10].replace('.', '-')
                        e_date = ev.get('END_DATE', '2026-12-31')[:10].replace('.', '-')
                        img_url = ev.get('MAIN_IMG', '')
                        org_link = ev.get('ORG_LINK', '')
                        use_fee = ev.get('USE_FEE', '별도문의')
                        lat = ev.get('LAT', None)
                        lng = ev.get('LOT', None)
                        
                        if not lat or not lng:
                            lat, lng = get_coords(place)

                        sql = """INSERT INTO event 
                                 (title, place_name, area, lat, lng, start_date, end_date, image_url, category, source, org_link, use_fee) 
                                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, '문화행사', 'SEOUL', %s, %s)
                                 ON DUPLICATE KEY UPDATE 
                                    lat=VALUES(lat), lng=VALUES(lng), 
                                    image_url=VALUES(image_url), use_fee=VALUES(use_fee),
                                    start_date=VALUES(start_date), end_date=VALUES(end_date)"""
                        
                        cursor.execute(sql, (title, place, area, lat, lng, s_date, e_date, img_url, org_link, use_fee))
                        total_saved += 1
                    except Exception as inner_e:
                        continue
                
                conn.commit() # 1,000개 단위로 커밋
                
                # 다음 1,000개를 위해 인덱스 증가
                start_idx += 1000
                end_idx += 1000
                
            else:
                # 더 이상 데이터가 없거나 에러인 경우
                break
                
        except Exception as e:
            print(f"   🔥 수집 중 중단: {e}")
            break

    print(f"   ✅ 서울시 데이터 총 {total_saved}건 싹쓸이 완료!")

def collect_kopis(cursor, conn):
    print("🎭 [Step 2-2] KOPIS 전국 데이터 수집 (1~2페이지 연속 수집 중)...")
    st = datetime.now().strftime('%Y%m%d')
    ed = (datetime.now() + timedelta(days=90)).strftime('%Y%m%d')
    
    count = 0
    for page in range(5, 7): 
        url = f"http://www.kopis.or.kr/openApi/restful/pblprfr?service={KOPIS_KEY}&stdate={st}&eddate={ed}&cpage={page}&rows=100"
        
        try:
            res = requests.get(url, timeout=10)
            root = ET.fromstring(res.text)
            
            if root.findtext('db/returncode'):
                print(f"   ⚠️ {page}페이지에서 API 제한이 발생했습니다. 건너뜁니다.")
                continue
                
            items = root.findall('db')
            print(f"   📡 {page}페이지에서 {len(items)}개의 데이터를 찾았습니다! 저장 시작...")
            
            for db in items:
                title = db.findtext('prfnm')
                if not title:
                    continue 
                    
                try:
                    mt20id = db.findtext('mt20id')
                    area = db.findtext('area') or "전국"
                    place = db.findtext('fcltynm') or "장소미상"
                    
                    detail_url = f"http://www.kopis.or.kr/openApi/restful/pblprfr/{mt20id}?service={KOPIS_KEY}"
                    d_res = requests.get(detail_url, timeout=10)
                    d_root = ET.fromstring(d_res.text).find('db')
                    
                    if d_root is not None:
                        # 🚨 [수정된 부분] 3층에 숨어있는 링크(org_link) 찾기 
                        link_node = d_root.find('.//relateurl')
                        org_link = link_node.text if link_node is not None and link_node.text else ""
                        
                        use_fee = d_root.findtext('pcseguidance') or ""
                        poster = d_root.findtext('poster') or ""
                        category = d_root.findtext('genrenm') or "기타"
                        
                        raw_start = d_root.findtext('prfpdfrom') or "2026.01.01"
                        raw_end = d_root.findtext('prfpdto') or "2026.12.31"
                        start_date = raw_start.replace('.', '-')
                        end_date = raw_end.replace('.', '-')
                        
                        lat, lng = get_coords(place)
                        
                        sql = """INSERT INTO event 
                                 (title, place_name, area, lat, lng, start_date, end_date, image_url, category, source, org_link, use_fee) 
                                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'KOPIS', %s, %s)
                                 ON DUPLICATE KEY UPDATE 
                                    end_date=VALUES(end_date), 
                                    area=VALUES(area), 
                                    org_link=VALUES(org_link), 
                                    use_fee=VALUES(use_fee)"""
                                 
                        cursor.execute(sql, (
                            title, place, area, lat, lng, 
                            start_date, end_date,
                            poster, category,
                            org_link, use_fee
                        ))
                        count += 1
                except Exception as inner_e:
                    continue 
                    
        except Exception as e:
            print(f"   ❌ KOPIS {page}페이지 통신 실패: {e}")
            
    conn.commit()
    print(f"   ✅ KOPIS 전국 데이터 총 {count}건 저장 완료!")

def collect_mmca(cursor, conn):

    print("🏛️ [Step 2-3] 국립현대미술관(MMCA) 현재 진행중인 모든 전시 수집...")
    
    options = Options()
    options.add_argument("--headless") 
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        driver.get("https://www.mmca.go.kr/exhibitions/progressList.do")
        time.sleep(3)
        
        list_boxes = driver.find_elements(By.CSS_SELECTOR, "#listDiv > ul > li")
        print(f"   🔍 MMCA에서 찾은 데이터 개수: {len(list_boxes)}개")
        
        count = 0
        for item in list_boxes:
            title = "제목없음"
            try:
                title = item.find_element(By.CSS_SELECTOR, "div > a > p").text.strip()
                if not title: continue
                
                img_url = item.find_element(By.TAG_NAME, "img").get_attribute("src")
                link = item.find_element(By.TAG_NAME, "a").get_attribute("href")
                place = "국립현대미술관 서울"
                
                text_all = item.text
                dates = re.findall(r'\d{4}[-.]\d{2}[-.]\d{2}', text_all)
                start_date = dates[0].replace('.', '-') if len(dates) > 0 else "2026-01-01"
                end_date = dates[1].replace('.', '-') if len(dates) > 1 else "2026-12-31"
                
                lat, lng = get_coords(place)
                
                sql = """INSERT INTO event (title, place_name, area, lat, lng, start_date, end_date, image_url, category, source, org_link, use_fee) 
                         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'MMCA', %s, %s)
                         ON DUPLICATE KEY UPDATE end_date=VALUES(end_date), org_link=VALUES(org_link), image_url=VALUES(image_url)"""
                cursor.execute(sql, (title, place, "서울", lat, lng, start_date, end_date, img_url, "전시", link, "홈페이지 확인"))
                count += 1
            except Exception as inner_e:
                # 🚨 범인 색출 로그! DB 컬럼 에러인지 여기서 100% 밝혀집니다.
                print(f"   ⚠️ MMCA 저장 실패 [{title}]: {inner_e}")
                continue
                
        conn.commit()
        print(f"   ✅ MMCA 전시 데이터 {count}건 저장 완료!")
    except Exception as e:
        print(f"   ❌ MMCA 크롤링 에러: {e}")
    finally:
        driver.quit()


    print("🖼️ [Step 2-4] 아트허브 수집 (제목 빈칸 오류 완벽 해결)...")
    
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    total_count = 0
    try:
        driver.get("https://www.arthub.co.kr/sub01/board03_list.htm?k_area=A")
        time.sleep(2)
        
        for page in range(1, 4): # 일단 3페이지만 확실히 테스트
            if page > 1:
                try:
                    driver.find_element(By.LINK_TEXT, str(page)).click()
                    time.sleep(2)
                except: break
            
            links = driver.find_elements(By.CSS_SELECTOR, "a[href*='board03_view']")
            processed_titles = set()

            for a_tag in links:
                try:
                    # 🚨 [핵심 해결] Selenium의 .text가 비어있을 경우 숨겨진 텍스트(textContent)까지 싹 다 긁어오기!
                    title = a_tag.text.strip()
                    if not title:
                        title = a_tag.get_attribute("textContent").strip()
                    
                    link = a_tag.get_attribute("href")
                    
                    # 그래도 제목이 없으면 (이미지 썸네일 링크 등), 로그만 남기고 쿨하게 패스
                    if not title or len(title) < 2:
                        continue
                        
                    if title in processed_titles: continue
                    processed_titles.add(title)
                    
                    # 1. 날짜 추출 (TR 텍스트에서)
                    parent_tr = a_tag.find_element(By.XPATH, "./ancestor::tr[1]")
                    dates = re.findall(r'\d{4}[-.\s]+\d{1,2}[-.\s]+\d{1,2}', parent_tr.text)
                    
                    s_date, e_date = "2026-01-01", "2026-12-31"
                    if len(dates) >= 1:
                        d1 = re.split(r'[-.\s]+', dates[0].strip())
                        s_date = f"{d1[0]}-{int(d1[1]):02d}-{int(d1[2]):02d}"
                        e_date = s_date
                    if len(dates) >= 2:
                        d2 = re.split(r'[-.\s]+', dates[1].strip())
                        e_date = f"{d2[0]}-{int(d2[1]):02d}-{int(d2[2]):02d}"

                    # 2. 상세 정보 추출 (이미지 & 장소)
                    place_name = "전국 갤러리"
                    img_url = ""
                    try:
                        res = requests.get(link, timeout=5)
                        res.encoding = 'euc-kr'
                        soup = BeautifulSoup(res.text, 'html.parser')
                        
                        img_tag = soup.select_one("img[src*='data/']")
                        if img_tag:
                            img_url = "https://www.arthub.co.kr/" + img_tag['src'].lstrip('/')
                        
                        for line in soup.get_text().split('\n'):
                            if '장소 :' in line:
                                place_name = line.split('장소 :')[1].strip()[:40]
                                break
                    except: pass

                    lat, lng = get_coords(place_name)

                    # 3. DB 저장
                    sql = """INSERT INTO event 
                             (title, place_name, area, lat, lng, start_date, end_date, image_url, category, source, org_link) 
                             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, '미술전시', 'ARTHUB', %s)
                             ON DUPLICATE KEY UPDATE 
                                start_date=VALUES(start_date), end_date=VALUES(end_date),
                                lat=VALUES(lat), lng=VALUES(lng), image_url=VALUES(image_url)"""
                    
                    cursor.execute(sql, (title, place_name, "전국", lat, lng, s_date, e_date, img_url, link))
                    total_count += 1
                    
                except Exception as inner_e:
                    print(f"   ⚠️ 저장 실패 [{title}]: {inner_e}")
                    continue
        
        conn.commit()
        print(f"   ✅ 아트허브 {total_count}건 드디어 완벽 수집 완료!")
    finally:
        driver.quit()

def collect_naver_with_ai(cursor, conn):
    print("🟢 [Step 2-5] 네이버 블로그 AI 수집 (DB 구조 완벽 매칭)...")
    
    # 🚨 1. 여기에 발급받으신 키 3개를 넣어주세요!
    NAVER_SEARCH_ID = "AgR8LvwfQPeFyUFZ2npr"
    NAVER_SEARCH_SECRET = "vG63TkWFTc"
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    # 🚨 2. 네이버 검색 (한글이 깨지지 않게 params 방식으로 변경!)
    url = "https://openapi.naver.com/v1/search/blog.json"
    
    headers = {
        "X-Naver-Client-Id": NAVER_SEARCH_ID,
        "X-Naver-Client-Secret": NAVER_SEARCH_SECRET
    }
    
    # 이렇게 params 딕셔너리로 쪼개서 주면, 파이썬이 알아서 한글을 안전하게 변환해서 보냅니다.
    params = {
        "query": "서울 소규모 전시회",
        "display": 20,
        "sort": "date"
    }
    
    try:
        # 🚨 요청할 때 url 뒤에 params를 딱 붙여서 던집니다!
        res = requests.get(url, headers=headers, params=params, timeout=10)
        
        if res.status_code != 200:
            print(f"   ❌ 네이버 API 에러: {res.status_code}")
            return
            
        items = res.json().get('items', [])
        success_count = 0
        
        for item in items:
            try:
                # 텍스트 전처리 (HTML 태그 제거)
                raw_text = re.sub(r'<[^>]+>', '', item['title'] + " " + item['description'])
                blog_link = item['link']
                
                # 🚨 3. AI에게 우리 DB 구조(12개 칸)에 맞춰서 뽑아달라고 정확히 지시!
                prompt = f"""
                다음 블로그 글에서 전시회나 공연 정보를 추출해 JSON으로 응답해.
                정보가 없으면 null 처리해.
                
                [블로그 글]
                {raw_text}
                
                [출력 JSON 필수 키]
                - "title": 행사 제목
                - "place_name": 장소 이름
                - "start_date": 시작일 (YYYY-MM-DD 형식)
                - "end_date": 종료일 (YYYY-MM-DD 형식)
                - "use_fee": 이용료 (무료, 만원 등. 모르면 '별도 문의')
                """
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    response_format={ "type": "json_object" },
                    messages=[
                        {"role": "system", "content": "You are a data extractor."},
                        {"role": "user", "content": prompt}
                    ]
                )
                
                ai_result = json.loads(response.choices[0].message.content)
                
                # 4. AI가 뱉은 데이터 꺼내기
                title = ai_result.get('title')
                place = ai_result.get('place_name')
                s_date = ai_result.get('start_date') or "2026-01-01"
                e_date = ai_result.get('end_date') or s_date
                use_fee = ai_result.get('use_fee') or "별도 문의"
                
                # 제목이나 장소가 없으면 가짜 정보이므로 버림
                if not title or not place or title == "null" or place == "null":
                    continue
                    
                # 5. 좌표 변환
                lat, lng = get_coords(place)
                if lat is None: 
                    continue # 지도에 안 찍히는 곳도 버림 (데이터 품질 유지)
                
                # 🚨 6. 기존 DB 컬럼 12개에 완벽하게 대응하는 불도저 쿼리!
                sql = """INSERT INTO event 
                         (title, place_name, area, lat, lng, start_date, end_date, image_url, category, source, org_link, use_fee) 
                         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'NAVER_BLOG', %s, %s)
                         ON DUPLICATE KEY UPDATE 
                            place_name=VALUES(place_name), lat=VALUES(lat), lng=VALUES(lng),
                            start_date=VALUES(start_date), end_date=VALUES(end_date),
                            use_fee=VALUES(use_fee)"""
                
                # 블로그에는 썸네일 이미지가 일정하지 않으므로 image_url은 일단 빈칸으로 둡니다.
                cursor.execute(sql, (
                    title[:100], place[:50], '서울', lat, lng, s_date, e_date, 
                    '', '소규모전시', blog_link, use_fee[:50]
                ))
                success_count += 1
                
            except Exception as e:
                continue
                
        conn.commit()
        print(f"   ✅ 네이버+AI 수집: 총 {success_count}건 완벽하게 DB 저장 완료!")
        
    except Exception as e:
        print(f"   🔥 네이버 수집 중 치명적 오류: {e}")

ALLOWED_TAGS = [
    "화려한", "몽환적인", "생생한", "정갈한", "트렌디한", "톡톡튀는", 
    "우아한", "은은한", "과감한", "능동적인", "웅장한", "깊이있는", 
    "고전적인", "자유로운", "압도적인", "입체적인", "다채로운", "섬세한"
]

def apply_ai_tags(cursor, conn):
    print("🤖 [Step 3] AI 지능형 태깅 중 (허용된 태그 내에서 추출)...")
    
    query = "SELECT id, title, category FROM event WHERE hashtag IS NULL OR hashtag = ''"
    cursor.execute(query)
    rows = cursor.fetchall()
    
    if not rows:
        print("   ✅ 태깅할 새로운 데이터가 없습니다.")
        return

    tags_str = ", ".join(ALLOWED_TAGS)

    for row in rows:
        try:
            # 💡 DictCursor와 일반 Cursor 모두 완벽 대응
            if isinstance(row, dict):
                eid = row.get('id')
                title = row.get('title')
                cat = row.get('category')
            else:
                eid = row[0]
                title = row[1]
                cat = row[2]

            # 혹시 모를 빈 데이터 방어
            if not eid or not title:
                continue

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"공연/전시 전문가로서 다음 태그 리스트 중 제목과 가장 잘 어울리는 3개를 골라 콤마로 구분해 답변해.\n리스트: {tags_str}"},
                    {"role": "user", "content": f"제목: {title}, 카테고리: {cat}"}
                ],
                timeout=15 
            )
            
            selected_tags = response.choices[0].message.content.strip()
            
            cursor.execute("UPDATE event SET hashtag = %s WHERE id = %s", (selected_tags, int(eid)))
            conn.commit()
            print(f"   ✅ {title[:12]}... -> {selected_tags}")
            
            time.sleep(0.1)

        except Exception as e:
            print(f"   ❌ 태깅 중 에러 발생 ({title}): {e}")
            time.sleep(1) 
            continue

    print("   🚀 AI 태깅 단계가 종료되었습니다.")



# =====================================================
# 🚀 메인 실행 함수 (주소 컬럼 자동 추가 기능 탑재!)
# =====================================================
def main():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 1. source 컬럼 크기 확장 (기존)
            try:
                cursor.execute("ALTER TABLE event MODIFY COLUMN source VARCHAR(50);")
            except: pass
            
            print("=================================================")
            
            clean_old_data(cursor)  # (있다면 주석 해제)
            
            #collect_seoul(cursor, conn)    
            #collect_kopis(cursor, conn)    
            #collect_mmca(cursor, conn)  
            collect_naver_with_ai(cursor, conn)   
            
            
            apply_ai_tags(cursor, conn) 
            
    except Exception as e:
        print(f"❌ 전체 파이프라인 에러: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()