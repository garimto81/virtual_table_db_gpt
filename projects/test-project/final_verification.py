#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

def verify_smart_mode_implementation():
    """스마트 모드 구현 최종 검증"""
    
    template_path = os.path.join(".", "Archive-MAM", "templates", "index.html")
    
    if not os.path.exists(template_path):
        print("ERROR: 템플릿 파일을 찾을 수 없습니다.")
        return False
    
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("스마트 모드 구현 검증 중...")
    print("=" * 50)
    
    # 필수 기능 확인
    required_features = {
        "라디오 버튼": r'name="analysisMode".*?value="smart"',
        "스마트 모드 텍스트": r'스마트 모드',
        "SmartUIDetector 클래스": r'class SmartUIDetector',
        "감지 시작 함수": r'startDetection\(\)',
        "감지 중지 함수": r'stopDetection\(\)',
        "토글 함수": r'function toggleSmartDetection',
        "상태 업데이트 함수": r'function updateSmartStatus',
        "스마트 분석 시작": r'function startSmartAnalysis',
        "UI 감지 버튼": r'UI 감지 시작',
        "9개 감지 셀": r'smart-cell-[0-8]',
        "결과 다운로드": r'exportSmartResults',
    }
    
    passed = 0
    total = len(required_features)
    
    for feature_name, pattern in required_features.items():
        if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
            print(f"✓ {feature_name}: 발견됨")
            passed += 1
        else:
            print(f"✗ {feature_name}: 누락됨")
    
    print("=" * 50)
    print(f"검증 결과: {passed}/{total} 기능 구현됨")
    
    if passed == total:
        print("SUCCESS: 모든 스마트 모드 기능이 구현되었습니다!")
        print("\n다음 단계:")
        print("1. 서버 실행: cd Archive-MAM && python run_poker_app.py dev")
        print("2. 브라우저에서 http://localhost:5000 접속")
        print("3. '스마트 모드 (NEW!)' 선택 후 비디오 파일 업로드")
        print("4. 스마트 UI 감지 인터페이스에서 테스트")
        return True
    else:
        print("WARNING: 일부 기능이 누락되었습니다.")
        return False

if __name__ == "__main__":
    verify_smart_mode_implementation()