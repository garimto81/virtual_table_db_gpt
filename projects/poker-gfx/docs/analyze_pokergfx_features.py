# -*- coding: utf-8 -*-
import PyPDF2
import re
import sys
import io
from pdf_streaming_reader import PDFStreamingReader
from collections import defaultdict

# UTF-8 인코딩 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def deep_analyze_pokergfx(pdf_path):
    """PokerGFX 매뉴얼 심층 분석"""
    reader = PDFStreamingReader(pdf_path, chunk_size=20)
    
    features = {
        'core_features': [],
        'technical_specs': [],
        'ui_components': [],
        'video_features': [],
        'audio_features': [],
        'licensing_tiers': {},
        'studio_features': [],
        'streaming_features': [],
        'security_features': []
    }
    
    for start_page, end_page, pages_content in reader.read_pages_in_chunks():
        for page_data in pages_content:
            text = page_data['text']
            lines = text.split('\n')
            
            for i, line in enumerate(lines):
                line_clean = line.strip()
                line_lower = line_clean.lower()
                
                # 라이선싱 계층 분석
                if 'basic' in line_lower and 'license' in line_lower:
                    features['licensing_tiers']['basic'] = extract_context(lines, i, 3)
                elif 'pro' in line_lower and 'license' in line_lower:
                    features['licensing_tiers']['pro'] = extract_context(lines, i, 3)
                elif 'enterprise' in line_lower and 'license' in line_lower:
                    features['licensing_tiers']['enterprise'] = extract_context(lines, i, 3)
                
                # 비디오 기능
                if any(word in line_lower for word in ['video', 'capture', 'mixing', 'encoding']):
                    features['video_features'].append(line_clean)
                
                # 오디오 기능
                if any(word in line_lower for word in ['audio', 'sound', 'microphone', 'voice']):
                    features['audio_features'].append(line_clean)
                
                # UI 컴포넌트
                if any(word in line_lower for word in ['button', 'panel', 'window', 'interface', 'menu']):
                    features['ui_components'].append(line_clean)
                
                # 스튜디오 기능
                if 'studio' in line_lower:
                    features['studio_features'].append(line_clean)
                
                # 스트리밍 기능
                if any(word in line_lower for word in ['stream', 'broadcast', 'live', 'rtmp']):
                    features['streaming_features'].append(line_clean)
                
                # 보안 기능
                if any(word in line_lower for word in ['dongle', 'security', 'license', 'protection']):
                    features['security_features'].append(line_clean)
                
                # GPU 관련 기술 사양
                if any(word in line_lower for word in ['gpu', 'cuda', 'opencl', 'hardware']):
                    features['technical_specs'].append(line_clean)
    
    return features

def extract_context(lines, index, context_size=2):
    """주변 컨텍스트 추출"""
    start = max(0, index - context_size)
    end = min(len(lines), index + context_size + 1)
    return ' '.join(lines[start:end]).strip()

def analyze_architecture(features):
    """아키텍처 분석"""
    architecture = {
        'rendering': 'GPU Pipeline',
        'video_processing': [],
        'audio_processing': [],
        'ui_framework': [],
        'streaming_protocols': []
    }
    
    # 비디오 처리 분석
    for feature in features['video_features']:
        if 'gpu' in feature.lower():
            architecture['video_processing'].append('GPU 가속 비디오 처리')
        if 'capture' in feature.lower():
            architecture['video_processing'].append('다중 소스 캡처')
        if 'mixing' in feature.lower():
            architecture['video_processing'].append('실시간 비디오 믹싱')
    
    # 스트리밍 프로토콜 분석
    for feature in features['streaming_features']:
        if 'rtmp' in feature.lower():
            architecture['streaming_protocols'].append('RTMP')
        if 'hls' in feature.lower():
            architecture['streaming_protocols'].append('HLS')
    
    return architecture

# 실행
if __name__ == "__main__":
    pdf_path = r"C:\claude\poker-gfx\docs\user-manual.pdf"
    print("PokerGFX 기능 심층 분석 중...")
    
    features = deep_analyze_pokergfx(pdf_path)
    architecture = analyze_architecture(features)
    
    # 분석 결과 저장
    import json
    with open('pokergfx_analysis.json', 'w', encoding='utf-8') as f:
        json.dump({
            'features': {k: list(set(v)) if isinstance(v, list) else v for k, v in features.items()},
            'architecture': architecture
        }, f, ensure_ascii=False, indent=2)
    
    print("분석 완료! pokergfx_analysis.json 파일 생성됨")