import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import time

load_dotenv()
KOPIS_API_KEY = os.getenv("KOPIS_API_KEY")

def get_kopis_detail(mt20id):
    """
    공연/전시 ID(mt20id)를 받아서 상세 정보를 조회하는 함수
    """
    url = f"http://www.kopis.or.kr/openApi/restful/pblprfr/{mt20id}"
    params = {'service': KOPIS_API_KEY}
    
    try:
        res = requests.get(url, params=params)
        root = ET.fromstring(res.text)
        db = root.find('db')
        
        # 원하는 상세 정보 추출
        price = db.find('pcseguidance').text  # 티켓 가격
        description = db.find('sty').text     # 줄거리/작품설명 (가장 중요!)
        runtime = db.find('dtguidance').text  # 관람 시간 (화~금 10:00...)
        
        # 데이터가 없을 경우 처리
        if description is None: description = "상세 설명이 없습니다."
        if price is None: price = "무료 또는 현장 확인"
        
        return price, description, runtime
        
    except Exception:
        return "정보 없음", "정보 없음", "정보 없음"

def fetch_kopis_data():
    print("🔄 KOPIS 데이터 수집 시작 (상세 정보 포함)...")
    
    today = datetime.now()
    next_month = today + timedelta(days=30)
    
    url = "http://www.kopis.or.kr/openApi/restful/pblprfr"
    params = {
        'service': KOPIS_API_KEY,
        'stdate': today.strftime("%Y%m%d"),
        'eddate': next_month.strftime("%Y%m%d"),
        'cpage': 1,
        'rows': 10,       # 테스트니까 10개만 (너무 많으면 느려짐)
        'prfstate': '02', # 공연중
    }

    response = requests.get(url, params=params)
    root = ET.fromstring(response.text)
    results = []
    
    for item in root.findall('db'):
        mt20id = item.find('mt20id').text
        title = item.find('prfnm').text
        
        print(f"  > 상세 조회 중: {title}...")
        
        # [핵심] 여기서 상세 API를 호출합니다!
        price, desc, runtime = get_kopis_detail(mt20id)
        
        exh = {
            "id": mt20id,
            "title": title,
            "place": item.find('fcltynm').text,
            "period": f"{item.find('prfpdfrom').text} ~ {item.find('prfpdto').text}",
            "poster": item.find('poster').text,
            "price": price,       # 추가된 가격
            "desc": desc,         # 추가된 상세 설명 (AI 추천에 필수)
            "runtime": runtime    # 추가된 관람 시간
        }
        results.append(exh)
        # API 서버에 부담 주지 않게 0.1초 쉬기
        time.sleep(0.1)
            
    print(f"✅ 수집 완료: {len(results)}건")
    return results  