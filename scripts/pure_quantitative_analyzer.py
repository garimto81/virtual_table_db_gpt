#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
순수 정량 데이터 기반 분석 시스템
해석이나 판단을 배제하고 원시 데이터와 수학적 계산만 사용
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class RawMetric:
    """원시 측정값"""
    timestamp: str
    source: str  # 'youtube' or 'poker_site'
    identifier: str  # video_id or site_name
    measurements: Dict[str, float]  # metric_name: value

@dataclass
class CalculatedValue:
    """계산된 값 (해석 없음)"""
    calculation_type: str  # 'sum', 'mean', 'std', 'count', 'ratio', 'difference'
    input_values: List[float]
    output_value: float
    timestamp: str

class PureQuantitativeAnalyzer:
    """순수 정량 분석기 - 해석 없이 수치만 처리"""
    
    def __init__(self):
        self.raw_metrics = []
        self.calculated_values = []
        
    def collect_youtube_raw_data(self, youtube_data: Dict) -> List[RawMetric]:
        """YouTube 원시 데이터 수집"""
        raw_data = []
        
        for video in youtube_data.get('videos', []):
            metric = RawMetric(
                timestamp=datetime.now().isoformat(),
                source='youtube',
                identifier=video.get('video_id', ''),
                measurements={
                    'view_count': float(video.get('view_count', 0)),
                    'like_count': float(video.get('like_count', 0)),
                    'comment_count': float(video.get('comment_count', 0)),
                    'published_timestamp': self.date_to_timestamp(video.get('published_date', '')),
                    'title_length': float(len(video.get('title', ''))),
                    'has_wsop': float(1 if 'wsop' in video.get('title', '').lower() else 0),
                    'has_gto': float(1 if 'gto' in video.get('title', '').lower() else 0),
                    'has_poker': float(1 if 'poker' in video.get('title', '').lower() else 0)
                }
            )
            raw_data.append(metric)
            
        return raw_data
    
    def collect_poker_site_raw_data(self, poker_data: Dict) -> List[RawMetric]:
        """포커 사이트 원시 데이터 수집"""
        raw_data = []
        
        for site_name, site_data in poker_data.get('sites', {}).items():
            # 현재 시점 데이터
            metric = RawMetric(
                timestamp=datetime.now().isoformat(),
                source='poker_site',
                identifier=site_name,
                measurements={
                    'players_online': float(site_data.get('current_players', 0)),
                    'is_gg_network': float(1 if site_data.get('category') == 'GG_POKER' else 0)
                }
            )
            raw_data.append(metric)
            
            # 과거 시점 데이터
            for daily in site_data.get('daily_data', []):
                historical_metric = RawMetric(
                    timestamp=daily.get('date', ''),
                    source='poker_site',
                    identifier=site_name,
                    measurements={
                        'players_online': float(daily.get('players_online', 0))
                    }
                )
                raw_data.append(historical_metric)
                
        return raw_data
    
    def calculate_basic_statistics(self, values: List[float], calc_type: str) -> CalculatedValue:
        """기본 통계 계산 (해석 없음)"""
        if not values:
            return CalculatedValue(
                calculation_type=calc_type,
                input_values=[],
                output_value=0.0,
                timestamp=datetime.now().isoformat()
            )
        
        if calc_type == 'sum':
            result = sum(values)
        elif calc_type == 'mean':
            result = sum(values) / len(values)
        elif calc_type == 'std':
            result = np.std(values) if len(values) > 1 else 0.0
        elif calc_type == 'min':
            result = min(values)
        elif calc_type == 'max':
            result = max(values)
        elif calc_type == 'count':
            result = float(len(values))
        elif calc_type == 'variance':
            result = np.var(values) if len(values) > 1 else 0.0
        else:
            result = 0.0
            
        return CalculatedValue(
            calculation_type=calc_type,
            input_values=values,
            output_value=result,
            timestamp=datetime.now().isoformat()
        )
    
    def calculate_ratios(self, numerator: float, denominator: float) -> CalculatedValue:
        """비율 계산"""
        if denominator == 0:
            ratio = 0.0
        else:
            ratio = numerator / denominator
            
        return CalculatedValue(
            calculation_type='ratio',
            input_values=[numerator, denominator],
            output_value=ratio,
            timestamp=datetime.now().isoformat()
        )
    
    def calculate_differences(self, values: List[float]) -> List[CalculatedValue]:
        """차이 계산 (연속된 값들 간)"""
        differences = []
        
        for i in range(1, len(values)):
            diff = CalculatedValue(
                calculation_type='difference',
                input_values=[values[i-1], values[i]],
                output_value=values[i] - values[i-1],
                timestamp=datetime.now().isoformat()
            )
            differences.append(diff)
            
        return differences
    
    def calculate_time_intervals(self, timestamps: List[float]) -> List[CalculatedValue]:
        """시간 간격 계산"""
        intervals = []
        
        sorted_timestamps = sorted(timestamps)
        for i in range(1, len(sorted_timestamps)):
            interval = CalculatedValue(
                calculation_type='time_interval',
                input_values=[sorted_timestamps[i-1], sorted_timestamps[i]],
                output_value=sorted_timestamps[i] - sorted_timestamps[i-1],
                timestamp=datetime.now().isoformat()
            )
            intervals.append(interval)
            
        return intervals
    
    def count_occurrences(self, binary_values: List[float]) -> CalculatedValue:
        """발생 횟수 계산 (0 또는 1 값)"""
        count = sum(1 for v in binary_values if v == 1.0)
        
        return CalculatedValue(
            calculation_type='occurrence_count',
            input_values=binary_values,
            output_value=float(count),
            timestamp=datetime.now().isoformat()
        )
    
    def calculate_percentiles(self, values: List[float]) -> Dict[int, CalculatedValue]:
        """백분위수 계산"""
        if not values:
            return {}
            
        percentiles = {}
        for p in [25, 50, 75, 90, 95, 99]:
            percentiles[p] = CalculatedValue(
                calculation_type=f'percentile_{p}',
                input_values=values,
                output_value=np.percentile(values, p),
                timestamp=datetime.now().isoformat()
            )
            
        return percentiles
    
    def create_value_matrix(self, metrics: List[RawMetric]) -> pd.DataFrame:
        """원시 메트릭을 값 행렬로 변환"""
        data = []
        
        for metric in metrics:
            row = {
                'timestamp': metric.timestamp,
                'source': metric.source,
                'identifier': metric.identifier
            }
            row.update(metric.measurements)
            data.append(row)
            
        return pd.DataFrame(data)
    
    def calculate_cooccurrence_matrix(self, binary_features: Dict[str, List[float]]) -> Dict[Tuple[str, str], float]:
        """동시 발생 행렬 계산"""
        cooccurrence = {}
        
        feature_names = list(binary_features.keys())
        for i, feature1 in enumerate(feature_names):
            for j, feature2 in enumerate(feature_names):
                if i <= j:  # 상삼각 행렬만
                    values1 = binary_features[feature1]
                    values2 = binary_features[feature2]
                    
                    # 두 특성이 모두 1인 경우의 수
                    co_count = sum(1 for k in range(len(values1)) 
                                  if values1[k] == 1.0 and values2[k] == 1.0)
                    
                    cooccurrence[(feature1, feature2)] = float(co_count)
                    
        return cooccurrence
    
    def calculate_sequential_patterns(self, time_series: List[float], window_size: int = 3) -> Dict[str, int]:
        """연속 패턴 계산 (상승/하락/유지)"""
        if len(time_series) < window_size:
            return {}
            
        patterns = {}
        
        for i in range(len(time_series) - window_size + 1):
            window = time_series[i:i+window_size]
            
            # 패턴을 숫자로 인코딩 (1: 상승, 0: 유지, -1: 하락)
            pattern_code = []
            for j in range(1, len(window)):
                if window[j] > window[j-1]:
                    pattern_code.append('1')
                elif window[j] < window[j-1]:
                    pattern_code.append('-1')
                else:
                    pattern_code.append('0')
                    
            pattern_str = ','.join(pattern_code)
            patterns[pattern_str] = patterns.get(pattern_str, 0) + 1
            
        return patterns
    
    def generate_raw_output(self, youtube_data: Dict, poker_data: Dict) -> Dict:
        """원시 출력 생성 (해석 없음)"""
        # 데이터 수집
        youtube_raw = self.collect_youtube_raw_data(youtube_data)
        poker_raw = self.collect_poker_site_raw_data(poker_data)
        
        # YouTube 수치 계산
        youtube_values = {}
        if youtube_raw:
            view_counts = [m.measurements['view_count'] for m in youtube_raw]
            like_counts = [m.measurements['like_count'] for m in youtube_raw]
            comment_counts = [m.measurements['comment_count'] for m in youtube_raw]
            
            youtube_values['view_count_sum'] = self.calculate_basic_statistics(view_counts, 'sum').output_value
            youtube_values['view_count_mean'] = self.calculate_basic_statistics(view_counts, 'mean').output_value
            youtube_values['view_count_std'] = self.calculate_basic_statistics(view_counts, 'std').output_value
            youtube_values['view_count_min'] = self.calculate_basic_statistics(view_counts, 'min').output_value
            youtube_values['view_count_max'] = self.calculate_basic_statistics(view_counts, 'max').output_value
            
            youtube_values['like_count_sum'] = self.calculate_basic_statistics(like_counts, 'sum').output_value
            youtube_values['comment_count_sum'] = self.calculate_basic_statistics(comment_counts, 'sum').output_value
            
            # 비율 계산
            like_view_ratio = self.calculate_ratios(
                youtube_values['like_count_sum'], 
                youtube_values['view_count_sum']
            )
            youtube_values['like_per_view'] = like_view_ratio.output_value
            
            # 키워드 발생 횟수
            has_wsop = [m.measurements['has_wsop'] for m in youtube_raw]
            has_gto = [m.measurements['has_gto'] for m in youtube_raw]
            has_poker = [m.measurements['has_poker'] for m in youtube_raw]
            
            youtube_values['wsop_count'] = self.count_occurrences(has_wsop).output_value
            youtube_values['gto_count'] = self.count_occurrences(has_gto).output_value
            youtube_values['poker_count'] = self.count_occurrences(has_poker).output_value
            youtube_values['total_videos'] = float(len(youtube_raw))
        
        # 포커 사이트 수치 계산
        poker_values = {}
        current_poker = [m for m in poker_raw if m.timestamp == poker_raw[0].timestamp]
        
        if current_poker:
            player_counts = [m.measurements['players_online'] for m in current_poker]
            
            poker_values['total_players'] = self.calculate_basic_statistics(player_counts, 'sum').output_value
            poker_values['mean_players_per_site'] = self.calculate_basic_statistics(player_counts, 'mean').output_value
            poker_values['std_players'] = self.calculate_basic_statistics(player_counts, 'std').output_value
            poker_values['min_players'] = self.calculate_basic_statistics(player_counts, 'min').output_value
            poker_values['max_players'] = self.calculate_basic_statistics(player_counts, 'max').output_value
            poker_values['site_count'] = float(len(current_poker))
            
            # GG Network 수치
            gg_flags = [m.measurements.get('is_gg_network', 0) for m in current_poker]
            poker_values['gg_network_site_count'] = self.count_occurrences(gg_flags).output_value
            
            gg_players = [m.measurements['players_online'] for m in current_poker 
                         if m.measurements.get('is_gg_network', 0) == 1.0]
            if gg_players:
                poker_values['gg_network_total_players'] = sum(gg_players)
            else:
                poker_values['gg_network_total_players'] = 0.0
        
        # 시계열 수치 (각 사이트별)
        time_series_values = {}
        
        for site_name in poker_data.get('sites', {}).keys():
            site_history = sorted(
                [m for m in poker_raw if m.identifier == site_name],
                key=lambda x: x.timestamp
            )
            
            if len(site_history) >= 2:
                player_series = [m.measurements['players_online'] for m in site_history]
                
                # 차이값들
                differences = self.calculate_differences(player_series)
                if differences:
                    diff_values = [d.output_value for d in differences]
                    
                    time_series_values[f'{site_name}_diff_sum'] = sum(diff_values)
                    time_series_values[f'{site_name}_diff_mean'] = sum(diff_values) / len(diff_values)
                    time_series_values[f'{site_name}_diff_positive_count'] = sum(1 for d in diff_values if d > 0)
                    time_series_values[f'{site_name}_diff_negative_count'] = sum(1 for d in diff_values if d < 0)
                    time_series_values[f'{site_name}_diff_zero_count'] = sum(1 for d in diff_values if d == 0)
                
                # 첫 값과 마지막 값
                time_series_values[f'{site_name}_first_value'] = player_series[0]
                time_series_values[f'{site_name}_last_value'] = player_series[-1]
                time_series_values[f'{site_name}_total_change'] = player_series[-1] - player_series[0]
        
        # 백분위수 계산
        percentile_values = {}
        
        if view_counts:
            view_percentiles = self.calculate_percentiles(view_counts)
            for p, calc in view_percentiles.items():
                percentile_values[f'youtube_views_p{p}'] = calc.output_value
        
        if player_counts:
            player_percentiles = self.calculate_percentiles(player_counts)
            for p, calc in player_percentiles.items():
                percentile_values[f'poker_players_p{p}'] = calc.output_value
        
        # 모든 수치 통합
        all_values = {
            'timestamp': datetime.now().isoformat(),
            'youtube': youtube_values,
            'poker_sites': poker_values,
            'time_series': time_series_values,
            'percentiles': percentile_values,
            'raw_data_counts': {
                'youtube_videos': len(youtube_raw),
                'poker_measurements': len(poker_raw)
            }
        }
        
        return all_values
    
    def date_to_timestamp(self, date_str: str) -> float:
        """날짜 문자열을 타임스탬프로 변환"""
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.timestamp()
        except:
            return 0.0
    
    def save_raw_output(self, output: Dict, filename: str = None):
        """원시 출력 저장"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"pure_quantitative_output_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        logger.info(f"순수 정량 데이터 저장: {filename}")
        return filename

# 메인 실행 함수
def main():
    # 샘플 데이터
    youtube_data = {
        'videos': [
            {'video_id': 'v1', 'title': 'WSOP 2025 Main Event', 'view_count': 125000, 
             'like_count': 8500, 'comment_count': 1200, 'published_date': '2025-07-31'},
            {'video_id': 'v2', 'title': 'GTO Poker Strategy', 'view_count': 87000, 
             'like_count': 10700, 'comment_count': 890, 'published_date': '2025-07-30'},
            {'video_id': 'v3', 'title': 'Online Poker Tips', 'view_count': 42000, 
             'like_count': 3200, 'comment_count': 450, 'published_date': '2025-07-29'}
        ]
    }
    
    poker_data = {
        'sites': {
            'Site_A': {
                'current_players': 12500,
                'category': 'COMPETITOR',
                'daily_data': [
                    {'date': '2025-08-01', 'players_online': 12500},
                    {'date': '2025-07-31', 'players_online': 11800},
                    {'date': '2025-07-30', 'players_online': 11500}
                ]
            },
            'Site_B': {
                'current_players': 8200,
                'category': 'GG_POKER',
                'daily_data': [
                    {'date': '2025-08-01', 'players_online': 8200},
                    {'date': '2025-07-31', 'players_online': 7800},
                    {'date': '2025-07-30', 'players_online': 7600}
                ]
            }
        }
    }
    
    # 분석 실행
    analyzer = PureQuantitativeAnalyzer()
    output = analyzer.generate_raw_output(youtube_data, poker_data)
    
    # 결과 저장
    filename = analyzer.save_raw_output(output)
    
    # 순수 수치만 출력
    print("\n=== 순수 정량 데이터 출력 ===")
    print(f"저장 파일: {filename}")
    print(f"\nYouTube 수치:")
    for key, value in output['youtube'].items():
        print(f"  {key}: {value}")
    print(f"\n포커 사이트 수치:")
    for key, value in output['poker_sites'].items():
        print(f"  {key}: {value}")

if __name__ == "__main__":
    main()