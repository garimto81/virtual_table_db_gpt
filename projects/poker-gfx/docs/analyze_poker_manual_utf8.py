# -*- coding: utf-8 -*-
import PyPDF2
import os
import sys
from pdf_splitter import PDFSplitter
from pdf_streaming_reader import PDFStreamingReader

# UTF-8 인코딩 설정
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def check_pdf_info(pdf_path):
    """PDF 파일 정보 확인"""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        total_pages = len(pdf_reader.pages)
        
        # 메타데이터 추출
        metadata = pdf_reader.metadata if pdf_reader.metadata else {}
        
        print(f"PDF 파일 정보:")
        print(f"- 총 페이지 수: {total_pages}")
        print(f"- 제목: {metadata.get('/Title', 'N/A')}")
        print(f"- 작성자: {metadata.get('/Author', 'N/A')}")
        print(f"- 생성일: {metadata.get('/CreationDate', 'N/A')}")
        
        return total_pages

def analyze_pdf_content(pdf_path):
    """PDF 내용 분석"""
    # 스트리밍 리더 사용 (메모리 효율적)
    reader = PDFStreamingReader(pdf_path, chunk_size=50)
    
    all_text = []
    page_summaries = []
    
    print("\n페이지별 분석 시작...")
    
    for start_page, end_page, pages_content in reader.read_pages_in_chunks():
        print(f"\n청크 처리 중: 페이지 {start_page}-{end_page}")
        
        for page_data in pages_content:
            page_num = page_data['page_number']
            text = page_data['text']
            
            # 텍스트 길이와 첫 100자 저장
            if text.strip():
                # 유니코드 문자 처리
                preview = text.strip()[:200].replace('\n', ' ')
                preview = preview.encode('utf-8', errors='ignore').decode('utf-8')
                
                page_summaries.append({
                    'page': page_num,
                    'text_length': len(text),
                    'preview': preview
                })
                all_text.append(text)
    
    return page_summaries, '\n'.join(all_text)

def extract_key_info(full_text):
    """PokerGFX 관련 주요 정보 추출"""
    info = {
        'features': [],
        'requirements': [],
        'commands': [],
        'settings': []
    }
    
    lines = full_text.split('\n')
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        # 기능 관련
        if any(keyword in line_lower for keyword in ['feature', 'function', '기능']):
            info['features'].append(line.strip())
        
        # 요구사항 관련
        if any(keyword in line_lower for keyword in ['requirement', 'require', '요구', '필요']):
            info['requirements'].append(line.strip())
        
        # 명령어 관련
        if any(keyword in line_lower for keyword in ['command', 'cmd', '명령']):
            info['commands'].append(line.strip())
        
        # 설정 관련
        if any(keyword in line_lower for keyword in ['setting', 'config', 'option', '설정']):
            info['settings'].append(line.strip())
    
    return info

# 메인 실행
if __name__ == "__main__":
    pdf_path = r"C:\claude\poker-gfx\docs\user-manual.pdf"
    
    # 1. PDF 정보 확인
    total_pages = check_pdf_info(pdf_path)
    
    # 2. 100페이지 이상인지 확인
    if total_pages > 100:
        print(f"\nPDF가 {total_pages}페이지로 100페이지를 초과합니다.")
        print("분할 처리를 사용하여 전체 문서를 분석합니다...")
    
    # 3. 내용 분석
    page_summaries, full_text = analyze_pdf_content(pdf_path)
    
    # 4. 결과 출력
    print(f"\n{'='*50}")
    print(f"분석 결과 요약")
    print(f"{'='*50}")
    print(f"총 {len(page_summaries)}개 페이지 분석 완료")
    
    # 처음 10페이지 미리보기
    print("\n주요 페이지 내용:")
    for i, summary in enumerate(page_summaries[:10]):
        if summary['text_length'] > 50:  # 의미있는 내용이 있는 페이지만
            print(f"\n페이지 {summary['page']} ({summary['text_length']}자):")
            print(f"  {summary['preview'][:100]}...")
    
    # PokerGFX 관련 정보 추출
    key_info = extract_key_info(full_text)
    
    print(f"\n{'='*50}")
    print("PokerGFX 주요 정보")
    print(f"{'='*50}")
    
    # 주요 기능
    if key_info['features']:
        print("\n[주요 기능]")
        for feature in key_info['features'][:5]:
            print(f"  • {feature}")
    
    # 요구사항
    if key_info['requirements']:
        print("\n[시스템 요구사항]")
        for req in key_info['requirements'][:5]:
            print(f"  • {req}")
    
    # 명령어
    if key_info['commands']:
        print("\n[명령어/단축키]")
        for cmd in key_info['commands'][:5]:
            print(f"  • {cmd}")
    
    # 설정
    if key_info['settings']:
        print("\n[주요 설정]")
        for setting in key_info['settings'][:5]:
            print(f"  • {setting}")
    
    # 전체 텍스트 통계
    word_count = len(full_text.split())
    print(f"\n{'='*50}")
    print("문서 통계")
    print(f"{'='*50}")
    print(f"총 문자 수: {len(full_text):,}")
    print(f"총 단어 수: {word_count:,}")
    print(f"평균 페이지당 단어: {word_count // len(page_summaries) if page_summaries else 0}")
    
    # 분할 처리 제안
    if total_pages > 100:
        print(f"\n{'='*50}")
        print("API 처리 제안")
        print(f"{'='*50}")
        print(f"이 PDF는 {total_pages}페이지로 100페이지를 초과합니다.")
        print(f"다음과 같이 분할 처리하는 것을 권장합니다:")
        print(f"  - 1차: 1-100 페이지")
        print(f"  - 2차: 101-{total_pages} 페이지")
        print(f"\n제공된 PDF 분할 도구를 사용하면 자동으로 처리됩니다.")