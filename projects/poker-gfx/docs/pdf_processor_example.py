from pdf_splitter import PDFSplitter
import asyncio
import aiohttp
import json
from typing import List, Dict, Any
import os

class PDFAPIProcessor:
    def __init__(self, api_url: str, api_key: str = None, max_pages: int = 100):
        self.api_url = api_url
        self.api_key = api_key
        self.splitter = PDFSplitter(max_pages=max_pages)
        
    async def process_pdf_chunk(self, session: aiohttp.ClientSession, pdf_path: str) -> Dict[str, Any]:
        """
        단일 PDF 청크를 API로 처리합니다.
        """
        headers = {}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        
        with open(pdf_path, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field('file', f, filename=os.path.basename(pdf_path), content_type='application/pdf')
            
            async with session.post(self.api_url, data=data, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"API 오류: {response.status} - {await response.text()}")
    
    async def process_large_pdf_async(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        대용량 PDF를 비동기적으로 처리합니다.
        """
        # PDF 분할
        split_files = self.splitter.split_pdf(pdf_path)
        
        # 비동기 처리
        async with aiohttp.ClientSession() as session:
            tasks = []
            for split_file in split_files:
                task = self.process_pdf_chunk(session, split_file)
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 임시 파일 정리
        for split_file in split_files:
            if split_file != pdf_path and os.path.exists(split_file):
                os.remove(split_file)
        
        return results
    
    def process_large_pdf_sync(self, pdf_path: str) -> Dict[str, Any]:
        """
        대용량 PDF를 동기적으로 처리합니다.
        """
        def api_processor(chunk_path: str) -> Dict[str, Any]:
            # 여기에 실제 API 호출 로직 구현
            import requests
            
            headers = {}
            if self.api_key:
                headers['Authorization'] = f'Bearer {self.api_key}'
            
            with open(chunk_path, 'rb') as f:
                files = {'file': (os.path.basename(chunk_path), f, 'application/pdf')}
                response = requests.post(self.api_url, files=files, headers=headers)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    raise Exception(f"API 오류: {response.status_code} - {response.text}")
        
        # PDFSplitter의 process_large_pdf 메소드 사용
        results = self.splitter.process_large_pdf(pdf_path, api_processor, merge_results=False)
        
        # 결과 병합
        merged_result = self.merge_api_results(results)
        return merged_result
    
    def merge_api_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        API 결과를 병합합니다. 실제 API 응답 형식에 맞게 수정하세요.
        """
        merged = {
            'total_pages_processed': 0,
            'combined_text': '',
            'metadata': [],
            'errors': []
        }
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                merged['errors'].append({
                    'chunk': i + 1,
                    'error': str(result)
                })
            elif result:
                # 예시: 텍스트 추출 API의 경우
                if 'text' in result:
                    merged['combined_text'] += result['text'] + '\n'
                if 'pages' in result:
                    merged['total_pages_processed'] += result['pages']
                if 'metadata' in result:
                    merged['metadata'].append(result['metadata'])
        
        return merged


# 사용 예시
async def main():
    # API 프로세서 초기화
    processor = PDFAPIProcessor(
        api_url="https://your-api-endpoint.com/process-pdf",
        api_key="your-api-key",
        max_pages=100
    )
    
    # 비동기 처리
    pdf_file = "large_document.pdf"
    try:
        results = await processor.process_large_pdf_async(pdf_file)
        print(f"비동기 처리 완료: {len(results)}개 청크 처리됨")
    except Exception as e:
        print(f"처리 중 오류 발생: {e}")


# 동기 처리 예시
def sync_example():
    processor = PDFAPIProcessor(
        api_url="https://your-api-endpoint.com/process-pdf",
        api_key="your-api-key",
        max_pages=100
    )
    
    pdf_file = "large_document.pdf"
    try:
        result = processor.process_large_pdf_sync(pdf_file)
        print(f"처리 완료: {result['total_pages_processed']}페이지 처리됨")
    except Exception as e:
        print(f"처리 중 오류 발생: {e}")


if __name__ == "__main__":
    # 비동기 실행
    # asyncio.run(main())
    
    # 동기 실행
    sync_example()