#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import webbrowser
import requests

def check_smart_mode():
    """스마트 모드 기능 확인"""
    template_path = os.path.join(".", "Archive-MAM", "templates", "index.html")
    
    if not os.path.exists(template_path):
        print("템플릿 파일을 찾을 수 없습니다.")
        return False
    
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 스마트 모드 관련 키워드 확인
    smart_keywords = [
        '스마트 모드',
        'SmartUIDetector',
        'toggleSmartDetection',
        'startSmartAnalysis',
        'smart-cell-'
    ]
    
    found = []
    for keyword in smart_keywords:
        if keyword in content:
            found.append(keyword)
    
    print(f"스마트 모드 기능 확인: {len(found)}/{len(smart_keywords)} 개 발견")
    for item in found:
        print(f"  - {item}")
    
    return len(found) >= 4

def test_server():
    """서버 연결 테스트"""
    try:
        response = requests.get("http://localhost:5000", timeout=3)
        return response.status_code == 200
    except:
        return False

def main():
    print("스마트 모드 테스트 시작")
    print("=" * 40)
    
    # 1. 스마트 모드 코드 확인
    if check_smart_mode():
        print("OK: 스마트 모드 코드가 템플릿에 추가되었습니다.")
    else:
        print("ERROR: 스마트 모드 코드가 부족합니다.")
        return
    
    # 2. 서버 확인
    if test_server():
        print("OK: 서버가 실행 중입니다.")
        print("브라우저에서 http://localhost:5000 을 열어보세요.")
        try:
            webbrowser.open("http://localhost:5000")
        except:
            pass
    else:
        print("WARNING: 서버가 실행되지 않았습니다.")
        print("다음 명령어로 서버를 시작하세요:")
        print("cd Archive-MAM && python run_poker_app.py dev")
    
    print("\n테스트 완료!")
    print("브라우저에서 다음을 확인하세요:")
    print("1. '분석 모드 선택' 섹션이 보이는지")
    print("2. '스마트 모드 (NEW!)' 옵션이 있는지")
    print("3. 파일 업로드 후 스마트 분석이 시작되는지")

if __name__ == "__main__":
    main()