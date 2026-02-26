# auto_worker.py (최신화 버전)
import schedule
import time
from datetime import datetime
from collector import main as run_all_collectors # 최신 수집/태깅 통합본 불러오기

def daily_job():
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"\n🚀 [{now_str}] 일일 자동화 파이프라인 가동 시작!")
    
    # 만료 데이터 삭제 -> 서울 수집 -> KOPIS 수집 -> AI 태깅이 한 방에 실행됨
    run_all_collectors()
    
    print(f"🎉 [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 파이프라인 실행 완료!")

# 1. 실행 시 즉시 한 번 작동 (테스트용)
daily_job()

# 2. 매일 새벽 4시에 예약
schedule.every().day.at("04:00").do(daily_job)

print("\n⏰ 스케줄러 가동 중... 매일 새벽 4시에 DB가 자동으로 갱신됩니다.")
while True:
    schedule.run_pending()
    time.sleep(60)