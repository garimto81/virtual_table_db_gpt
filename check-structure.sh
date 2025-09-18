#!/bin/bash
# check-structure.sh - 프로젝트 구조 검증 스크립트

echo "🔍 Virtual Table DB 프로젝트 구조 검증 중..."
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 카운터
errors=0
warnings=0

# 필수 폴더 확인
echo ""
echo "📁 필수 폴더 확인..."
required_dirs=("src" "docs" "tests" "config" "assets")
for dir in "${required_dirs[@]}"; do
  if [ ! -d "$dir" ]; then
    echo -e "${RED}❌ 필수 폴더 누락: $dir${NC}"
    ((errors++))
  else
    echo -e "${GREEN}✅ $dir 존재${NC}"
  fi
done

# 필수 파일 확인
echo ""
echo "📄 필수 파일 확인..."
required_files=("index.html" "README.md" ".gitignore" "PROJECT_STRUCTURE.md")
for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ 필수 파일 누락: $file${NC}"
    ((errors++))
  else
    echo -e "${GREEN}✅ $file 존재${NC}"
  fi
done

# 루트 레벨 파일 수 확인
echo ""
echo "📊 루트 디렉토리 정리 상태..."
root_files=$(find . -maxdepth 1 -type f ! -name ".*" | wc -l)
if [ $root_files -gt 10 ]; then
  echo -e "${YELLOW}⚠️  경고: 루트 디렉토리에 파일이 너무 많습니다 ($root_files개)${NC}"
  echo "   권장: 10개 이하"
  ((warnings++))
else
  echo -e "${GREEN}✅ 루트 파일 수 적절 ($root_files개)${NC}"
fi

# 임시 파일 확인
echo ""
echo "🗑️ 임시 파일 확인..."
temp_files=$(find . -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name "*.bak" | wc -l)
if [ $temp_files -gt 0 ]; then
  echo -e "${YELLOW}⚠️  임시 파일 발견: $temp_files개${NC}"
  find . -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name "*.bak" | head -5
  ((warnings++))
else
  echo -e "${GREEN}✅ 임시 파일 없음${NC}"
fi

# 빈 폴더 확인
echo ""
echo "📂 빈 폴더 확인..."
empty_dirs=$(find . -type d -empty | wc -l)
if [ $empty_dirs -gt 0 ]; then
  echo -e "${YELLOW}⚠️  빈 폴더 발견: $empty_dirs개${NC}"
  find . -type d -empty | head -5
  ((warnings++))
else
  echo -e "${GREEN}✅ 빈 폴더 없음${NC}"
fi

# 대용량 파일 확인 (10MB 이상)
echo ""
echo "📦 대용량 파일 확인 (10MB 이상)..."
large_files=$(find . -type f -size +10M 2>/dev/null | wc -l)
if [ $large_files -gt 0 ]; then
  echo -e "${YELLOW}⚠️  대용량 파일 발견: $large_files개${NC}"
  find . -type f -size +10M -exec ls -lh {} \; 2>/dev/null | head -5
  ((warnings++))
else
  echo -e "${GREEN}✅ 대용량 파일 없음${NC}"
fi

# 결과 요약
echo ""
echo "================================"
echo "📋 검증 결과 요약"
echo "================================"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
  echo -e "${GREEN}🎉 완벽! 모든 검사를 통과했습니다.${NC}"
  exit 0
elif [ $errors -eq 0 ]; then
  echo -e "${YELLOW}✅ 구조는 정상이나 ${warnings}개의 경고가 있습니다.${NC}"
  echo "   cleanup.sh 실행을 권장합니다."
  exit 0
else
  echo -e "${RED}❌ ${errors}개의 오류와 ${warnings}개의 경고가 있습니다.${NC}"
  echo "   구조 수정이 필요합니다."
  exit 1
fi