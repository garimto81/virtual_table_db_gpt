# -*- coding: utf-8 -*-
import PyPDF2
import sys
import io
import json
import re
from collections import defaultdict

# UTF-8 인코딩 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_complete_manual(pdf_path):
    """PDF에서 모든 텍스트를 완전히 추출"""
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        total_pages = len(pdf_reader.pages)
        
        print(f"총 {total_pages}페이지 추출 시작...")
        
        # 전체 매뉴얼 내용을 저장할 구조
        manual_content = {
            'metadata': {
                'title': 'PokerGFX User Manual v3.2.0',
                'total_pages': total_pages,
                'sections': []
            },
            'full_text': [],
            'sections': defaultdict(list),
            'page_content': {}
        }
        
        # 페이지별로 전체 텍스트 추출
        for page_num in range(total_pages):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            
            # 페이지 내용 저장
            manual_content['page_content'][page_num + 1] = text
            manual_content['full_text'].append(f"\n\n=== PAGE {page_num + 1} ===\n\n{text}")
            
            print(f"페이지 {page_num + 1}/{total_pages} 추출 완료")
        
        # 전체 텍스트 결합
        complete_text = '\n'.join(manual_content['full_text'])
        
        # 섹션 분석
        sections = analyze_sections(complete_text)
        manual_content['sections'] = sections
        
        return manual_content, complete_text

def analyze_sections(text):
    """텍스트에서 섹션 구조 분석"""
    sections = defaultdict(list)
    
    # 주요 섹션 패턴
    section_patterns = [
        (r'Table of Contents', 'table_of_contents'),
        (r'Introduction', 'introduction'),
        (r'Installation', 'installation'),
        (r'License Tiers', 'licensing'),
        (r'The Interface', 'interface'),
        (r'Video Sources', 'video_sources'),
        (r'Capture Devices', 'capture_devices'),
        (r'Audio Input', 'audio'),
        (r'Rendering the Video', 'rendering'),
        (r'Studio', 'studio'),
        (r'Action Tracker', 'action_tracker'),
        (r'RFID Video Poker Table', 'rfid_table'),
        (r'Secure Delay', 'secure_delay'),
        (r'MultiGFX', 'multigfx'),
        (r'Skins', 'skins'),
        (r'Remote Control', 'remote_control'),
        (r'Live API', 'live_api'),
        (r'Troubleshooting', 'troubleshooting'),
        (r'Settings', 'settings'),
        (r'Graphics Settings', 'graphics_settings'),
        (r'Outputs Settings', 'outputs_settings'),
        (r'Server Settings', 'server_settings'),
        (r'Game Settings', 'game_settings'),
    ]
    
    lines = text.split('\n')
    current_section = 'general'
    
    for i, line in enumerate(lines):
        # 섹션 헤더 찾기
        for pattern, section_name in section_patterns:
            if re.search(pattern, line, re.IGNORECASE) and len(line) < 100:
                current_section = section_name
                sections[current_section].append(f"=== {line.strip()} ===")
                break
        
        # 현재 섹션에 내용 추가
        if line.strip():
            sections[current_section].append(line.strip())
    
    return dict(sections)

def save_complete_manual(manual_content, output_path):
    """추출한 매뉴얼 내용을 파일로 저장"""
    
    # JSON 형식으로 구조화된 데이터 저장
    with open(output_path + '.json', 'w', encoding='utf-8') as f:
        # page_content는 너무 크므로 제외하고 저장
        save_data = {
            'metadata': manual_content['metadata'],
            'sections': manual_content['sections']
        }
        json.dump(save_data, f, ensure_ascii=False, indent=2)
    
    # 전체 텍스트를 텍스트 파일로 저장
    with open(output_path + '_full.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(manual_content['full_text']))
    
    # 페이지별 내용을 개별 파일로 저장
    for page_num, content in manual_content['page_content'].items():
        with open(f"{output_path}_page_{page_num:03d}.txt", 'w', encoding='utf-8') as f:
            f.write(content)
    
    print(f"\n추출 완료:")
    print(f"- 구조화된 데이터: {output_path}.json")
    print(f"- 전체 텍스트: {output_path}_full.txt")
    print(f"- 페이지별 파일: {output_path}_page_001.txt ~ {output_path}_page_{len(manual_content['page_content']):03d}.txt")

def extract_specific_features(text):
    """특정 기능들을 상세히 추출"""
    features = {
        'license_features': extract_license_features(text),
        'video_capabilities': extract_video_capabilities(text),
        'streaming_options': extract_streaming_options(text),
        'graphics_options': extract_graphics_options(text),
        'shortcuts': extract_shortcuts(text),
        'api_endpoints': extract_api_info(text),
        'system_requirements': extract_system_requirements(text)
    }
    return features

def extract_license_features(text):
    """라이선스별 기능 추출"""
    features = {
        'basic': [],
        'pro': [],
        'enterprise': []
    }
    
    lines = text.split('\n')
    current_license = None
    
    for line in lines:
        if 'Basic' in line and 'license' in line.lower():
            current_license = 'basic'
        elif 'Pro' in line and 'license' in line.lower():
            current_license = 'pro'
        elif 'Enterprise' in line and 'license' in line.lower():
            current_license = 'enterprise'
        
        if current_license and ('•' in line or '-' in line or '●' in line):
            features[current_license].append(line.strip())
    
    return features

def extract_video_capabilities(text):
    """비디오 관련 기능 추출"""
    capabilities = {
        'input_sources': [],
        'resolutions': [],
        'codecs': [],
        'effects': []
    }
    
    # 입력 소스 찾기
    if 'capture device' in text.lower():
        # 캡처 디바이스 관련 내용 추출
        pass
    
    # 해상도 찾기
    resolution_pattern = r'\d{3,4}x\d{3,4}'
    resolutions = re.findall(resolution_pattern, text)
    capabilities['resolutions'] = list(set(resolutions))
    
    # 코덱 찾기
    codec_keywords = ['H.264', 'H264', 'H.265', 'H265', 'HEVC', 'AVC']
    for codec in codec_keywords:
        if codec in text:
            capabilities['codecs'].append(codec)
    
    return capabilities

def extract_streaming_options(text):
    """스트리밍 옵션 추출"""
    options = {
        'protocols': [],
        'platforms': [],
        'features': []
    }
    
    # 프로토콜
    protocols = ['RTMP', 'SRT', 'NDI', 'HLS', 'WebRTC']
    for protocol in protocols:
        if protocol in text:
            options['protocols'].append(protocol)
    
    # 플랫폼
    platforms = ['Twitch', 'YouTube', 'Facebook', 'Custom RTMP']
    for platform in platforms:
        if platform in text:
            options['platforms'].append(platform)
    
    return options

def extract_graphics_options(text):
    """그래픽 옵션 추출"""
    graphics = {
        'overlays': [],
        'animations': [],
        'templates': []
    }
    
    # 그래픽 관련 키워드 검색
    lines = text.split('\n')
    for line in lines:
        if 'graphic' in line.lower() or 'overlay' in line.lower():
            if len(line) < 200:  # 적절한 길이의 라인만
                graphics['overlays'].append(line.strip())
    
    return graphics

def extract_shortcuts(text):
    """단축키 추출"""
    shortcuts = []
    
    # 단축키 패턴 찾기
    shortcut_pattern = r'(Ctrl|Alt|Shift|F\d+)[+\-]?\w*'
    found_shortcuts = re.findall(shortcut_pattern, text)
    
    # 주변 컨텍스트와 함께 추출
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if re.search(shortcut_pattern, line):
            shortcuts.append(line.strip())
    
    return list(set(shortcuts))

def extract_api_info(text):
    """API 정보 추출"""
    api_info = {
        'endpoints': [],
        'commands': [],
        'events': []
    }
    
    # API 관련 내용 찾기
    lines = text.split('\n')
    in_api_section = False
    
    for line in lines:
        if 'API' in line and ('Live' in line or 'Enterprise' in line):
            in_api_section = True
        
        if in_api_section:
            if 'http' in line.lower() or 'endpoint' in line.lower():
                api_info['endpoints'].append(line.strip())
            if 'command' in line.lower() or 'event' in line.lower():
                api_info['commands'].append(line.strip())
    
    return api_info

def extract_system_requirements(text):
    """시스템 요구사항 추출"""
    requirements = {
        'minimum': [],
        'recommended': [],
        'hardware': []
    }
    
    lines = text.split('\n')
    current_req = None
    
    for line in lines:
        if 'minimum' in line.lower() and 'requirement' in line.lower():
            current_req = 'minimum'
        elif 'recommended' in line.lower():
            current_req = 'recommended'
        
        if current_req and any(hw in line.lower() for hw in ['cpu', 'gpu', 'ram', 'memory', 'processor']):
            requirements[current_req].append(line.strip())
    
    return requirements

# 메인 실행
if __name__ == "__main__":
    pdf_path = r"C:\claude\poker-gfx\docs\user-manual.pdf"
    output_path = r"C:\claude\poker-gfx\docs\pokergfx_complete_manual"
    
    print("PokerGFX 매뉴얼 전체 내용 추출 시작...")
    
    # 전체 매뉴얼 추출
    manual_content, complete_text = extract_complete_manual(pdf_path)
    
    # 특정 기능 상세 추출
    features = extract_specific_features(complete_text)
    manual_content['detailed_features'] = features
    
    # 파일로 저장
    save_complete_manual(manual_content, output_path)
    
    print("\n추출 완료!")