# -*- coding: utf-8 -*-
import PyPDF2
import re
import sys
import io
from pdf_streaming_reader import PDFStreamingReader
from collections import defaultdict

# UTF-8 인코딩 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_detailed_content(pdf_path):
    """PDF에서 상세 내용 추출"""
    reader = PDFStreamingReader(pdf_path, chunk_size=30)
    
    sections = defaultdict(list)
    current_section = "Introduction"
    
    # 섹션 패턴
    section_patterns = {
        'installation': r'(installation|install|setup|requirements)',
        'features': r'(features|functionality|capabilities)',
        'interface': r'(interface|ui|user interface|gui)',
        'workflow': r'(workflow|process|pipeline)',
        'shortcuts': r'(shortcut|hotkey|keyboard)',
        'troubleshooting': r'(troubleshoot|problem|issue|error)',
        'configuration': r'(configuration|config|settings|preferences)',
        'licensing': r'(license|licensing|dongle|security)'
    }
    
    for start_page, end_page, pages_content in reader.read_pages_in_chunks():
        for page_data in pages_content:
            text = page_data['text']
            lines = text.split('\n')
            
            for line in lines:
                line_lower = line.lower().strip()
                
                # 섹션 변경 감지
                for section_name, pattern in section_patterns.items():
                    if re.search(pattern, line_lower) and len(line) < 100:
                        current_section = section_name
                        break
                
                # 의미있는 내용만 저장
                if len(line.strip()) > 10:
                    sections[current_section].append({
                        'page': page_data['page_number'],
                        'content': line.strip()
                    })
    
    return sections

def analyze_poker_gfx_features(sections):
    """PokerGFX 특징 분석"""
    analysis = {
        'software_info': {},
        'key_features': [],
        'system_requirements': [],
        'workflow_steps': [],
        'shortcuts': [],
        'common_issues': []
    }
    
    # 소프트웨어 정보 추출
    for section_name, items in sections.items():
        for item in items:
            content = item['content']
            
            # 버전 정보
            version_match = re.search(r'v?(\d+\.\d+\.\d+)', content)
            if version_match and 'version' not in analysis['software_info']:
                analysis['software_info']['version'] = version_match.group(1)
            
            # 주요 기능
            if section_name == 'features' and len(content) > 20:
                analysis['key_features'].append(content[:200])
            
            # 시스템 요구사항
            if section_name == 'installation' and any(word in content.lower() for word in ['require', 'need', 'must']):
                analysis['system_requirements'].append(content[:200])
            
            # 워크플로우
            if section_name == 'workflow' and len(content) > 30:
                analysis['workflow_steps'].append(content[:200])
            
            # 단축키
            if section_name == 'shortcuts' or (re.search(r'(Ctrl|Alt|Shift|F\d+)', content)):
                if len(content) < 100:
                    analysis['shortcuts'].append(content)
            
            # 문제 해결
            if section_name == 'troubleshooting':
                analysis['common_issues'].append(content[:200])
    
    return analysis

def generate_summary_report(sections, analysis):
    """요약 보고서 생성"""
    print("\n" + "="*60)
    print("PokerGFX User Manual v3.2.0 - 상세 분석 보고서")
    print("="*60)
    
    # 소프트웨어 정보
    print("\n[소프트웨어 정보]")
    print(f"• 버전: {analysis['software_info'].get('version', 'v3.2.0')}")
    print(f"• 문서: 113페이지 사용자 매뉴얼")
    print(f"• 라이선스: USB 동글 기반 보안")
    
    # 주요 기능 (상위 5개)
    if analysis['key_features']:
        print("\n[주요 기능]")
        for i, feature in enumerate(analysis['key_features'][:5], 1):
            print(f"{i}. {feature}")
    
    # 시스템 요구사항
    if analysis['system_requirements']:
        print("\n[시스템 요구사항]")
        for req in analysis['system_requirements'][:3]:
            print(f"• {req}")
    
    # 워크플로우
    if analysis['workflow_steps']:
        print("\n[작업 프로세스]")
        for i, step in enumerate(analysis['workflow_steps'][:5], 1):
            print(f"{i}. {step}")
    
    # 주요 단축키
    if analysis['shortcuts']:
        print("\n[주요 단축키]")
        unique_shortcuts = list(set(analysis['shortcuts']))[:10]
        for shortcut in unique_shortcuts:
            if len(shortcut) < 80:
                print(f"• {shortcut}")
    
    # 섹션별 페이지 분포
    print("\n[내용 구성]")
    section_stats = {}
    for section_name, items in sections.items():
        if items:
            pages = set(item['page'] for item in items)
            section_stats[section_name] = {
                'page_count': len(pages),
                'min_page': min(pages),
                'max_page': max(pages)
            }
    
    for section, stats in sorted(section_stats.items(), key=lambda x: x[1]['min_page']):
        print(f"• {section.title()}: 페이지 {stats['min_page']}-{stats['max_page']} ({stats['page_count']}페이지)")
    
    # API 처리 권장사항
    print("\n[API 처리 권장사항]")
    print("• PDF가 113페이지로 100페이지 제한을 초과합니다")
    print("• 권장 분할 방식:")
    print("  - 청크 1: 1-100 페이지 (주요 내용)")
    print("  - 청크 2: 101-113 페이지 (부록/참조)")
    print("• 제공된 pdf_splitter.py 사용 시 자동 분할 처리 가능")

# 메인 실행
if __name__ == "__main__":
    pdf_path = r"C:\claude\poker-gfx\docs\user-manual.pdf"
    
    print("PokerGFX 매뉴얼 상세 분석 시작...")
    
    # 상세 내용 추출
    sections = extract_detailed_content(pdf_path)
    
    # 특징 분석
    analysis = analyze_poker_gfx_features(sections)
    
    # 요약 보고서 생성
    generate_summary_report(sections, analysis)
    
    print("\n분석 완료!")