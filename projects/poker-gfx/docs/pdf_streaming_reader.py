import PyPDF2
import io
from typing import Generator, Tuple, List
import os

class PDFStreamingReader:
    """
    대용량 PDF를 메모리 효율적으로 읽기 위한 스트리밍 리더
    """
    
    def __init__(self, pdf_path: str, chunk_size: int = 100):
        self.pdf_path = pdf_path
        self.chunk_size = chunk_size
        
    def read_pages_in_chunks(self) -> Generator[Tuple[int, int, List], None, None]:
        """
        PDF를 chunk_size 단위로 읽어서 yield합니다.
        
        Yields:
            (start_page, end_page, pages_content): 시작 페이지, 끝 페이지, 페이지 내용 리스트
        """
        with open(self.pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            
            for start_idx in range(0, total_pages, self.chunk_size):
                end_idx = min(start_idx + self.chunk_size, total_pages)
                pages_content = []
                
                for page_num in range(start_idx, end_idx):
                    page = pdf_reader.pages[page_num]
                    pages_content.append({
                        'page_number': page_num + 1,
                        'text': page.extract_text(),
                        'metadata': page.get('/Annots', [])
                    })
                
                yield (start_idx + 1, end_idx, pages_content)
    
    def process_with_api_streaming(self, api_processor_func):
        """
        PDF를 스트리밍 방식으로 읽으면서 API 처리
        
        Args:
            api_processor_func: 페이지 청크를 처리할 함수
        
        Returns:
            처리된 결과들의 리스트
        """
        results = []
        
        for start_page, end_page, pages_content in self.read_pages_in_chunks():
            print(f"처리 중: 페이지 {start_page}-{end_page}")
            
            try:
                # API 처리 함수 호출
                result = api_processor_func(pages_content)
                results.append({
                    'pages': f"{start_page}-{end_page}",
                    'result': result
                })
            except Exception as e:
                print(f"페이지 {start_page}-{end_page} 처리 중 오류: {e}")
                results.append({
                    'pages': f"{start_page}-{end_page}",
                    'error': str(e)
                })
        
        return results
    
    def extract_text_in_chunks(self) -> Generator[str, None, None]:
        """
        텍스트만 청크 단위로 추출
        """
        for start_page, end_page, pages_content in self.read_pages_in_chunks():
            chunk_text = ""
            for page_data in pages_content:
                chunk_text += f"\n--- Page {page_data['page_number']} ---\n"
                chunk_text += page_data['text']
            
            yield chunk_text


# 메모리 효율적인 PDF 처리 예시
class MemoryEfficientPDFProcessor:
    def __init__(self, api_endpoint: str, max_pages_per_request: int = 100):
        self.api_endpoint = api_endpoint
        self.max_pages_per_request = max_pages_per_request
    
    def process_large_pdf(self, pdf_path: str):
        """
        대용량 PDF를 메모리 효율적으로 처리
        """
        reader = PDFStreamingReader(pdf_path, chunk_size=self.max_pages_per_request)
        
        # API 처리 함수 정의
        def api_processor(pages_content):
            # 텍스트만 추출하여 API로 전송
            text_data = "\n".join([page['text'] for page in pages_content])
            
            # 실제 API 호출 (예시)
            import requests
            response = requests.post(
                self.api_endpoint,
                json={'text': text_data, 'page_count': len(pages_content)},
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"API 오류: {response.status_code}")
        
        # 스트리밍 방식으로 처리
        results = reader.process_with_api_streaming(api_processor)
        
        # 결과 통합
        final_result = self.merge_results(results)
        return final_result
    
    def merge_results(self, results: List[dict]) -> dict:
        """
        청크별 결과를 통합
        """
        merged = {
            'total_chunks': len(results),
            'successful_chunks': 0,
            'failed_chunks': 0,
            'combined_data': []
        }
        
        for chunk_result in results:
            if 'error' in chunk_result:
                merged['failed_chunks'] += 1
            else:
                merged['successful_chunks'] += 1
                merged['combined_data'].append(chunk_result['result'])
        
        return merged


# 사용 예시
def example_usage():
    # 1. 스트리밍 방식으로 텍스트 추출
    reader = PDFStreamingReader("large_document.pdf", chunk_size=100)
    
    print("=== 텍스트 추출 (스트리밍) ===")
    for i, text_chunk in enumerate(reader.extract_text_in_chunks()):
        print(f"청크 {i+1}: {len(text_chunk)} 문자")
        # 여기서 각 청크를 개별적으로 처리 가능
    
    # 2. API와 함께 사용
    processor = MemoryEfficientPDFProcessor(
        api_endpoint="https://your-api.com/process",
        max_pages_per_request=100
    )
    
    try:
        result = processor.process_large_pdf("large_document.pdf")
        print(f"\n처리 완료: {result['successful_chunks']}/{result['total_chunks']} 청크 성공")
    except Exception as e:
        print(f"처리 중 오류: {e}")


if __name__ == "__main__":
    example_usage()