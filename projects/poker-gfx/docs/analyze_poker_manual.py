import PyPDF2
import os
from pdf_splitter import PDFSplitter
from pdf_streaming_reader import PDFStreamingReader

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
                preview = text.strip()[:200].replace('\n', ' ')
                page_summaries.append({
                    'page': page_num,
                    'text_length': len(text),
                    'preview': preview
                })
                all_text.append(text)
    
    return page_summaries, '\n'.join(all_text)

def extract_key_sections(full_text):
    """주요 섹션 추출"""
    sections = {}
    
    # 일반적인 섹션 키워드
    section_keywords = [
        'Table of Contents', 'Contents', '목차',
        'Introduction', 'Getting Started', '소개', '시작하기',
        'Features', '기능',
        'Installation', 'Setup', '설치', '설정',
        'Configuration', '구성',
        'Usage', 'How to', '사용법',
        'FAQ', '자주 묻는 질문',
        'Troubleshooting', '문제 해결',
        'Appendix', '부록'
    ]
    
    lines = full_text.split('\n')
    current_section = None
    current_content = []
    
    for line in lines:
        # 섹션 헤더 찾기
        for keyword in section_keywords:
            if keyword.lower() in line.lower() and len(line) < 100:
                if current_section:
                    sections[current_section] = '\n'.join(current_content[:5])  # 처음 5줄만
                current_section = line.strip()
                current_content = []
                break
        else:
            if current_section and line.strip():
                current_content.append(line.strip())
    
    # 마지막 섹션 저장
    if current_section:
        sections[current_section] = '\n'.join(current_content[:5])
    
    return sections

# 메인 실행
if __name__ == "__main__":
    pdf_path = r"C:\claude\poker-gfx\docs\user-manual.pdf"
    
    # 1. PDF 정보 확인
    total_pages = check_pdf_info(pdf_path)
    
    # 2. 100페이지 이상인지 확인
    if total_pages > 100:
        print(f"\nPDF가 {total_pages}페이지로 100페이지를 초과합니다.")
        print("분할 처리를 진행합니다...")
        
        # 분할 도구 사용
        splitter = PDFSplitter(max_pages=100)
        
        # 임시로 첫 100페이지만 분석
        print("\n첫 100페이지를 분석합니다...")
    
    # 3. 내용 분석
    page_summaries, full_text = analyze_pdf_content(pdf_path)
    
    # 4. 결과 출력
    print(f"\n=== 분석 결과 ===")
    print(f"총 {len(page_summaries)}개 페이지 분석 완료")
    
    # 처음 5페이지 미리보기
    print("\n처음 5페이지 미리보기:")
    for summary in page_summaries[:5]:
        print(f"\n페이지 {summary['page']}:")
        print(f"- 텍스트 길이: {summary['text_length']}자")
        print(f"- 내용: {summary['preview']}...")
    
    # 주요 섹션 추출
    sections = extract_key_sections(full_text)
    if sections:
        print("\n=== 발견된 주요 섹션 ===")
        for section_name, content in sections.items():
            print(f"\n[{section_name}]")
            print(content)
    
    # 전체 텍스트 통계
    word_count = len(full_text.split())
    print(f"\n=== 전체 문서 통계 ===")
    print(f"- 총 문자 수: {len(full_text):,}")
    print(f"- 총 단어 수: {word_count:,}")
    print(f"- 평균 페이지당 단어: {word_count // len(page_summaries) if page_summaries else 0}")