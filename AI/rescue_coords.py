from database import get_connection
import re
from collector import get_coords 

def rescue_missing_coords():
    print("🚑 좌표 심폐소생술(Rescue) 2차 가동 (가짜 빈칸 색출)...")
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 🚨 핵심 변경: 진짜 NULL, 빈칸(''), 글자 'None', 숫자 0으로 된 애들까지 싹 다 잡아옵니다!
            sql = """
                SELECT title, place_name, area 
                FROM event 
                WHERE lat IS NULL 
                   OR lat = '' 
                   OR lat = 'None' 
                   OR lat = '0' 
                   OR lat = '0.0'
            """
            cursor.execute(sql)
            missing_events = cursor.fetchall()
            
            print(f"   🔍 숨어있던 총 {len(missing_events)}개의 미아 좌표 발견! 복구를 시작합니다.")
            success_count = 0
            
            for evt in missing_events:
                title = evt['title']
                original_place = evt['place_name']
                area = evt['area']
                
                # 🚨 엑스칼리버 세탁기: 첫 괄호가 보이면 그 뒤는 통째로 날림!
                clean_place = original_place.split('(')[0].split('[')[0].strip()

# 팁: 이런 대형 기관은 앞에 'area(구 이름)'를 안 붙이는 게 검색이 더 잘 됩니다.
                search_keyword = clean_place
                
                lat, lng = get_coords(search_keyword)
                
                if lat and lng:
                    # 복구 성공 시 업데이트
                    update_sql = "UPDATE event SET lat=%s, lng=%s WHERE title=%s AND place_name=%s"
                    cursor.execute(update_sql, (lat, lng, title, original_place))
                    success_count += 1
            
            conn.commit()
            print(f"   ✅ 총 {success_count}개의 좌표를 지옥에서 건져냈습니다!")
            
    finally:
        conn.close()

if __name__ == "__main__":
    rescue_missing_coords()

conn = get_connection()
with conn.cursor() as c:
    c.execute("SELECT place_name FROM event WHERE lat IS NULL OR lat='' OR lat='0' LIMIT 5")
    print("❌ 실패한 악성 재고 TOP 5:", c.fetchall())