#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
스마트 모드 기능 테스트 스크립트
"""

import os
import sys
import subprocess
import time
import webbrowser
from urllib.parse import urljoin
import requests

def test_server_connection(url="http://localhost:5000"):
    """서버 연결 테스트"""
    try:
        response = requests.get(url, timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def check_smart_mode_in_template():
    """템플릿에서 스마트 모드 관련 코드 확인"""
    template_path = os.path.join(".", "Archive-MAM", "templates", "index.html")
    
    if not os.path.exists(template_path):
        return False, "템플릿 파일을 찾을 수 없습니다."
    
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    smart_mode_indicators = [
        '스마트 모드',
        'smart-mode',
        'SmartUIDetector',
        'toggleSmartDetection',
        'startSmartAnalysis'
    ]
    
    found_features = []
    for indicator in smart_mode_indicators:
        if indicator in content:
            found_features.append(indicator)
    
    return len(found_features) >= 3, f"발견된 스마트 모드 기능: {found_features}"

def main():
    print("=" * 60)
    print(" 스마트 모드 기능 테스트")
    print("=" * 60)
    
    # 1. 템플릿 파일에서 스마트 모드 코드 확인
    print("\n1. 템플릿 파일 스마트 모드 코드 확인...")
    has_smart_mode, message = check_smart_mode_in_template()
    
    if has_smart_mode:
        print(f"   ✅ {message}")
    else:
        print(f"   ❌ {message}")
        return
    
    # 2. 서버가 실행 중인지 확인
    print("\n2. 서버 연결 확인...")
    if test_server_connection():
        print("   ✅ 서버가 실행 중입니다 (http://localhost:5000)")
        
        # 브라우저에서 열기
        print("\n3. 브라우저에서 애플리케이션 열기...")
        try:
            webbrowser.open("http://localhost:5000")
            print("   ✅ 브라우저에서 애플리케이션을 열었습니다")
            
            print("\n" + "=" * 60)
            print(" 테스트 완료! 브라우저에서 다음을 확인하세요:")
            print("=" * 60)
            print("1. 메인 페이지에서 '분석 모드 선택' 섹션이 보이는가?")
            print("2. '🧠 스마트 모드 (NEW!)' 라디오 버튼이 선택되어 있는가?")
            print("3. 파일을 업로드하고 스마트 모드로 분석을 시작할 수 있는가?")
            print("4. 스마트 UI 감지 인터페이스가 나타나는가?")
            print("5. '🔍 UI 감지 시작' 버튼이 작동하는가?")
            print("\n만약 위 기능들이 모두 정상 작동한다면 스마트 모드가 성공적으로 구현된 것입니다!")
            
        except Exception as e:
            print(f"   ⚠️ 브라우저 열기 실패: {e}")
            print("   수동으로 http://localhost:5000 에 접속하세요")
    else:
        print("   ❌ 서버가 실행되지 않았습니다")
        print("   다음 명령어로 서버를 시작하세요:")
        print("   cd Archive-MAM && python run_poker_app.py dev")

if __name__ == "__main__":
    main()