import os
import PyPDF2
from typing import List, Tuple
import tempfile
import shutil

class PDFSplitter:
    def __init__(self, max_pages: int = 100):
        self.max_pages = max_pages
    
    def split_pdf(self, pdf_path: str, output_dir: str = None) -> List[str]:
        """
        PDF 파일을 지정된 페이지 수로 분할합니다.
        
        Args:
            pdf_path: 원본 PDF 파일 경로
            output_dir: 분할된 PDF 파일들을 저장할 디렉토리 (기본값: 임시 디렉토리)
        
        Returns:
            분할된 PDF 파일 경로 리스트
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF 파일을 찾을 수 없습니다: {pdf_path}")
        
        # 출력 디렉토리 설정
        if output_dir is None:
            output_dir = tempfile.mkdtemp()
        else:
            os.makedirs(output_dir, exist_ok=True)
        
        # PDF 읽기
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            
            if total_pages <= self.max_pages:
                # 페이지 수가 제한 이하면 원본 파일 경로만 반환
                return [pdf_path]
            
            split_files = []
            base_name = os.path.splitext(os.path.basename(pdf_path))[0]
            
            # PDF 분할
            for i in range(0, total_pages, self.max_pages):
                pdf_writer = PyPDF2.PdfWriter()
                
                # 현재 부분의 페이지들 추가
                end_page = min(i + self.max_pages, total_pages)
                for page_num in range(i, end_page):
                    pdf_writer.add_page(pdf_reader.pages[page_num])
                
                # 분할된 PDF 저장
                part_num = (i // self.max_pages) + 1
                output_filename = f"{base_name}_part_{part_num}.pdf"
                output_path = os.path.join(output_dir, output_filename)
                
                with open(output_path, 'wb') as output_file:
                    pdf_writer.write(output_file)
                
                split_files.append(output_path)
                print(f"생성됨: {output_filename} (페이지 {i+1}-{end_page})")
            
            return split_files
    
    def process_large_pdf(self, pdf_path: str, process_function, merge_results=True):
        """
        대용량 PDF를 분할하여 처리하고 결과를 병합합니다.
        
        Args:
            pdf_path: 원본 PDF 파일 경로
            process_function: 각 분할된 PDF를 처리할 함수
            merge_results: 결과를 병합할지 여부
        
        Returns:
            처리 결과 (merge_results=True인 경우 병합된 결과, False인 경우 개별 결과 리스트)
        """
        temp_dir = tempfile.mkdtemp()
        
        try:
            # PDF 분할
            split_files = self.split_pdf(pdf_path, temp_dir)
            results = []
            
            # 각 분할된 PDF 처리
            for i, split_file in enumerate(split_files):
                print(f"\n처리 중: {os.path.basename(split_file)} ({i+1}/{len(split_files)})")
                try:
                    result = process_function(split_file)
                    results.append(result)
                except Exception as e:
                    print(f"처리 중 오류 발생: {e}")
                    results.append(None)
            
            # 결과 병합 또는 반환
            if merge_results and len(results) > 1:
                return self._merge_results(results)
            else:
                return results
                
        finally:
            # 임시 파일 정리
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
    
    def _merge_results(self, results: List):
        """
        처리 결과를 병합합니다. (기본 구현은 리스트 연결)
        필요에 따라 오버라이드하여 사용하세요.
        """
        merged = []
        for result in results:
            if result is not None:
                if isinstance(result, list):
                    merged.extend(result)
                elif isinstance(result, str):
                    merged.append(result)
                else:
                    merged.append(result)
        return merged


# 사용 예시
def example_usage():
    splitter = PDFSplitter(max_pages=100)
    
    # 예시 1: PDF 파일 단순 분할
    pdf_path = "large_document.pdf"
    split_files = splitter.split_pdf(pdf_path, "output_splits")
    print(f"PDF가 {len(split_files)}개 파일로 분할되었습니다.")
    
    # 예시 2: API 호출을 통한 처리
    def process_pdf_with_api(pdf_file_path):
        # 여기에 실제 API 호출 로직 구현
        # 예: response = api.process_pdf(pdf_file_path)
        print(f"API로 처리 중: {pdf_file_path}")
        return f"처리 결과: {pdf_file_path}"
    
    # 대용량 PDF 처리 (자동으로 분할 -> 처리 -> 병합)
    results = splitter.process_large_pdf(pdf_path, process_pdf_with_api)
    print(f"\n전체 처리 결과: {results}")


if __name__ == "__main__":
    # 테스트용 코드
    example_usage()