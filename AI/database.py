import pymysql
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

# 🔌 DB 연결 함수
def get_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 4000)), # TiDB 포트
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        db=os.getenv("DB_NAME"),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        
        # 👇 [2] 여기 추가! (콤마 빼먹지 마세요!)
        # "인증서는 없지만 일단 암호화 통신(SSL)으로 연결해줘" 라는 뜻입니다.
        ssl={"check_hostname": False, "verify_mode": ssl.CERT_NONE}
    )

# 🏗️ 테이블 초기화 (최초 1회 실행용)
def init_db():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # events 테이블 생성 (AI 태그 컬럼 포함)
            sql = """
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                place_name VARCHAR(255),
                address VARCHAR(255),
                lat DOUBLE,
                lng DOUBLE,
                start_date VARCHAR(50),
                end_date VARCHAR(50),
                image_url TEXT,
                source VARCHAR(50), 
                hashtags VARCHAR(255), 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_event (title, place_name) 
            );
            """
            cursor.execute(sql)
        conn.commit()
        print("✅ DB 테이블(event) 초기화 완료! (hashtag 컬럼 포함)")
    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
    finally:
        conn.close()

# 💾 데이터 저장/업데이트 함수 (핵심)
def save_event(data):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 이미 있는 데이터면 업데이트(Update), 없으면 저장(Insert)
            sql = """
            INSERT INTO event (title, place_name, address, lat, lng, start_date, end_date, image_url, source, hashtag)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                address = VALUES(address),
                lat = VALUES(lat),
                lng = VALUES(lng),
                image_url = VALUES(image_url),
                end_date = VALUES(end_date),
                hashtags = VALUES(hashtags);
            """
            cursor.execute(sql, (
                data.get('title'),
                data.get('place_name', ''),
                data.get('address', ''),
                data.get('lat'),
                data.get('lng'),
                data.get('start_date', ''),
                data.get('end_date', ''),
                data.get('image_url', ''),
                data.get('source', 'ETC'),
                data.get('hashtags', '') # AI 태그가 있으면 같이 저장
            ))
        conn.commit()
        # print(f"💾 저장됨: {data.get('title')}") # 로그 너무 많으면 주석 처리
    except Exception as e:
        print(f"❌ 저장 에러 ({data.get('title')}): {e}")
    finally:
        conn.close()

# 🧪 테스트 실행용
if __name__ == "__main__":
    init_db()