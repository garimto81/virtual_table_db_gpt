# -*- coding: utf-8 -*-
import os
import json

def extract_detailed_sections():
    """전체 매뉴얼 텍스트에서 상세 섹션별로 내용 추출"""
    
    # 전체 텍스트 파일 읽기
    with open('pokergfx_complete_manual_full.txt', 'r', encoding='utf-8') as f:
        full_text = f.read()
    
    # 상세 섹션 추출
    sections = {
        'action_tracker_details': extract_action_tracker_details(full_text),
        'studio_details': extract_studio_details(full_text),
        'graphics_customization': extract_graphics_customization(full_text),
        'streaming_recording': extract_streaming_recording(full_text),
        'rfid_operations': extract_rfid_operations(full_text),
        'advanced_settings': extract_advanced_settings(full_text),
        'api_integration': extract_api_integration(full_text),
        'troubleshooting_guide': extract_troubleshooting_guide(full_text)
    }
    
    # 결과 저장
    with open('pokergfx_detailed_sections.json', 'w', encoding='utf-8') as f:
        json.dump(sections, f, ensure_ascii=False, indent=2)
    
    return sections

def extract_action_tracker_details(text):
    """Action Tracker 관련 모든 세부 내용 추출"""
    details = {
        'installation': [],
        'interface_elements': [],
        'operating_procedures': [],
        'keyboard_shortcuts': [],
        'special_features': []
    }
    
    lines = text.split('\n')
    in_action_tracker = False
    current_subsection = None
    
    for i, line in enumerate(lines):
        if 'Action Tracker' in line and 'PAGE' not in line:
            in_action_tracker = True
        elif 'Studio' in line or 'MultiGFX' in line:
            in_action_tracker = False
            
        if in_action_tracker:
            # 설치 관련
            if 'install' in line.lower() or 'download' in line.lower():
                details['installation'].append(line.strip())
                
            # 인터페이스 요소
            if any(word in line.lower() for word in ['button', 'display', 'console', 'icon']):
                details['interface_elements'].append(line.strip())
                
            # 작동 절차
            if any(word in line.lower() for word in ['touch', 'click', 'enter', 'select']):
                details['operating_procedures'].append(line.strip())
                
            # 키보드 단축키
            if any(key in line for key in ['Ctrl', 'Alt', 'Shift', 'F1', 'F2', 'F3']):
                details['keyboard_shortcuts'].append(line.strip())
                
            # 특수 기능
            if any(word in line.lower() for word in ['run it twice', 'straddle', 'chop', 'rabbit']):
                details['special_features'].append(line.strip())
    
    return details

def extract_studio_details(text):
    """Studio 기능 상세 내용 추출"""
    details = {
        'features': [],
        'workflow': [],
        'video_editing': [],
        'rendering_options': []
    }
    
    lines = text.split('\n')
    in_studio = False
    
    for line in lines:
        if 'Studio' in line and 'PAGE' not in line:
            in_studio = True
        elif in_studio and ('Settings' in line or 'PAGE' in line):
            in_studio = False
            
        if in_studio and line.strip():
            # 기능 목록
            if any(word in line.lower() for word in ['feature', 'tool', 'editor', 'player']):
                details['features'].append(line.strip())
                
            # 워크플로우
            if any(word in line.lower() for word in ['import', 'load', 'create', 'sync', 'render']):
                details['workflow'].append(line.strip())
                
            # 비디오 편집
            if any(word in line.lower() for word in ['timeline', 'cut', 'trim', 'adjust']):
                details['video_editing'].append(line.strip())
                
            # 렌더링 옵션
            if any(word in line.lower() for word in ['format', 'resolution', 'bitrate', 'quality']):
                details['rendering_options'].append(line.strip())
    
    return details

def extract_graphics_customization(text):
    """그래픽 커스터마이징 옵션 추출"""
    details = {
        'skins': [],
        'elements': [],
        'animations': [],
        'colors_fonts': [],
        'logos_branding': []
    }
    
    lines = text.split('\n')
    
    for line in lines:
        line_lower = line.lower()
        
        # 스킨 관련
        if 'skin' in line_lower:
            details['skins'].append(line.strip())
            
        # 그래픽 요소
        if any(word in line_lower for word in ['player box', 'leaderboard', 'ticker', 'overlay']):
            details['elements'].append(line.strip())
            
        # 애니메이션
        if any(word in line_lower for word in ['animation', 'transition', 'effect', 'fade']):
            details['animations'].append(line.strip())
            
        # 색상 및 폰트
        if any(word in line_lower for word in ['color', 'colour', 'font', 'text']):
            details['colors_fonts'].append(line.strip())
            
        # 로고 및 브랜딩
        if any(word in line_lower for word in ['logo', 'sponsor', 'brand', 'custom']):
            details['logos_branding'].append(line.strip())
    
    return details

def extract_streaming_recording(text):
    """스트리밍 및 녹화 설정 추출"""
    details = {
        'streaming_platforms': [],
        'recording_formats': [],
        'quality_settings': [],
        'secure_delay': [],
        'output_devices': []
    }
    
    lines = text.split('\n')
    
    for line in lines:
        line_lower = line.lower()
        
        # 스트리밍 플랫폼
        if any(platform in line_lower for platform in ['twitch', 'youtube', 'facebook', 'rtmp']):
            details['streaming_platforms'].append(line.strip())
            
        # 녹화 포맷
        if any(format in line_lower for format in ['mp4', 'mov', 'avi', 'prores']):
            details['recording_formats'].append(line.strip())
            
        # 품질 설정
        if any(word in line_lower for word in ['bitrate', 'resolution', 'fps', 'quality']):
            details['quality_settings'].append(line.strip())
            
        # 보안 딜레이
        if 'delay' in line_lower and ('secure' in line_lower or 'security' in line_lower):
            details['secure_delay'].append(line.strip())
            
        # 출력 장치
        if any(word in line_lower for word in ['ndi', 'decklink', 'output device']):
            details['output_devices'].append(line.strip())
    
    return details

def extract_rfid_operations(text):
    """RFID 작동 관련 내용 추출"""
    details = {
        'setup': [],
        'calibration': [],
        'card_registration': [],
        'troubleshooting': [],
        'wifi_configuration': []
    }
    
    lines = text.split('\n')
    
    for line in lines:
        line_lower = line.lower()
        
        # 설정
        if 'rfid' in line_lower and any(word in line_lower for word in ['setup', 'connect', 'install']):
            details['setup'].append(line.strip())
            
        # 칼리브레이션
        if 'calibrat' in line_lower:
            details['calibration'].append(line.strip())
            
        # 카드 등록
        if any(word in line_lower for word in ['register', 'card', 'deck']) and 'rfid' in line_lower:
            details['card_registration'].append(line.strip())
            
        # 문제 해결
        if 'rfid' in line_lower and any(word in line_lower for word in ['troubleshoot', 'problem', 'issue']):
            details['troubleshooting'].append(line.strip())
            
        # WiFi 설정
        if 'wifi' in line_lower or 'wireless' in line_lower:
            details['wifi_configuration'].append(line.strip())
    
    return details

def extract_advanced_settings(text):
    """고급 설정 옵션 추출"""
    details = {
        'server_settings': [],
        'game_settings': [],
        'network_settings': [],
        'performance_settings': [],
        'security_settings': []
    }
    
    lines = text.split('\n')
    
    for line in lines:
        line_lower = line.lower()
        
        # 서버 설정
        if 'server' in line_lower and 'setting' in line_lower:
            details['server_settings'].append(line.strip())
            
        # 게임 설정
        if any(word in line_lower for word in ['blind', 'ante', 'straddle', 'betting']):
            details['game_settings'].append(line.strip())
            
        # 네트워크 설정
        if any(word in line_lower for word in ['port', 'ip', 'network', 'firewall']):
            details['network_settings'].append(line.strip())
            
        # 성능 설정
        if any(word in line_lower for word in ['gpu', 'cpu', 'performance', 'memory']):
            details['performance_settings'].append(line.strip())
            
        # 보안 설정
        if any(word in line_lower for word in ['password', 'security', 'authentication', 'encrypt']):
            details['security_settings'].append(line.strip())
    
    return details

def extract_api_integration(text):
    """API 통합 관련 내용 추출"""
    details = {
        'endpoints': [],
        'websocket_events': [],
        'authentication': [],
        'examples': [],
        'enterprise_features': []
    }
    
    lines = text.split('\n')
    in_api_section = False
    
    for line in lines:
        if 'Live API' in line or 'API' in line and 'Enterprise' in line:
            in_api_section = True
        elif in_api_section and 'PAGE' in line:
            in_api_section = False
            
        if in_api_section or 'api' in line.lower():
            # 엔드포인트
            if '/' in line and any(word in line.lower() for word in ['api', 'endpoint']):
                details['endpoints'].append(line.strip())
                
            # WebSocket 이벤트
            if 'websocket' in line.lower() or 'ws://' in line:
                details['websocket_events'].append(line.strip())
                
            # 인증
            if any(word in line.lower() for word in ['auth', 'token', 'key']):
                details['authentication'].append(line.strip())
                
            # 예제
            if any(word in line.lower() for word in ['example', 'sample', 'code']):
                details['examples'].append(line.strip())
                
            # 엔터프라이즈 기능
            if 'enterprise' in line.lower():
                details['enterprise_features'].append(line.strip())
    
    return details

def extract_troubleshooting_guide(text):
    """문제 해결 가이드 추출"""
    details = {
        'common_issues': [],
        'solutions': [],
        'error_messages': [],
        'performance_tips': [],
        'support_info': []
    }
    
    lines = text.split('\n')
    in_troubleshooting = False
    
    for line in lines:
        if 'Troubleshooting' in line:
            in_troubleshooting = True
        elif in_troubleshooting and 'PAGE' in line:
            in_troubleshooting = False
            
        # 일반적인 문제
        if any(word in line.lower() for word in ['issue', 'problem', 'fail', 'error', 'not work']):
            details['common_issues'].append(line.strip())
            
        # 해결책
        if any(word in line.lower() for word in ['solution', 'fix', 'resolve', 'try']):
            details['solutions'].append(line.strip())
            
        # 오류 메시지
        if 'error' in line.lower() and ':' in line:
            details['error_messages'].append(line.strip())
            
        # 성능 팁
        if any(word in line.lower() for word in ['performance', 'optimize', 'improve', 'faster']):
            details['performance_tips'].append(line.strip())
            
        # 지원 정보
        if any(word in line.lower() for word in ['support', 'help', 'contact', 'email']):
            details['support_info'].append(line.strip())
    
    return details

# 실행
if __name__ == "__main__":
    print("상세 섹션 추출 시작...")
    sections = extract_detailed_sections()
    
    # 결과 요약 출력
    for section_name, content in sections.items():
        total_items = sum(len(v) for v in content.values())
        print(f"\n{section_name}: {total_items}개 항목 추출")
        for key, items in content.items():
            if items:
                print(f"  - {key}: {len(items)}개")
    
    print("\n추출 완료! pokergfx_detailed_sections.json 파일 생성됨")