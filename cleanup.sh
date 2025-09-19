#!/bin/bash
# cleanup.sh - 프로젝트 정리 스크립트

echo "🧹 Virtual Table DB 프로젝트 정리 시작..."
echo "================================"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 카운터
cleaned_items=0

# 1. 임시 파일 제거
echo ""
echo "🗑️ 임시 파일 제거 중..."
temp_count=$(find . -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name "*.bak" -o -name "*.swp" -o -name "*.swo" | wc -l)
if [ $temp_count -gt 0 ]; then
  find . -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name "*.bak" -o -name "*.swp" -o -name "*.swo" -exec rm -f {} \;
  echo -e "${GREEN}✅ ${temp_count}개의 임시 파일 제거됨${NC}"
  ((cleaned_items+=$temp_count))
else
  echo "   임시 파일 없음"
fi

# 2. OS 관련 파일 제거
echo ""
echo "💻 OS 관련 파일 제거 중..."
os_count=0

# macOS .DS_Store 제거
ds_count=$(find . -name ".DS_Store" | wc -l)
if [ $ds_count -gt 0 ]; then
  find . -name ".DS_Store" -delete
  echo -e "${GREEN}✅ ${ds_count}개의 .DS_Store 파일 제거됨${NC}"
  ((os_count+=$ds_count))
fi

# Windows Thumbs.db 제거
thumbs_count=$(find . -name "Thumbs.db" | wc -l)
if [ $thumbs_count -gt 0 ]; then
  find . -name "Thumbs.db" -delete
  echo -e "${GREEN}✅ ${thumbs_count}개의 Thumbs.db 파일 제거됨${NC}"
  ((os_count+=$thumbs_count))
fi

if [ $os_count -eq 0 ]; then
  echo "   OS 관련 파일 없음"
else
  ((cleaned_items+=$os_count))
fi

# 3. 빈 폴더 제거
echo ""
echo "📂 빈 폴더 제거 중..."
empty_count=$(find . -type d -empty | wc -l)
if [ $empty_count -gt 0 ]; then
  # .git 관련 폴더는 제외
  find . -type d -empty ! -path "./.git/*" -delete 2>/dev/null
  remaining=$(find . -type d -empty | wc -l)
  removed=$((empty_count - remaining))
  if [ $removed -gt 0 ]; then
    echo -e "${GREEN}✅ ${removed}개의 빈 폴더 제거됨${NC}"
    ((cleaned_items+=$removed))
  else
    echo "   제거할 빈 폴더 없음 (.git 폴더 제외)"
  fi
else
  echo "   빈 폴더 없음"
fi

# 4. 로그 파일 정리 (30일 이상 된 것)
echo ""
echo "📝 오래된 로그 파일 확인 중..."
old_logs=$(find . -name "*.log" -mtime +30 | wc -l)
if [ $old_logs -gt 0 ]; then
  echo -e "${YELLOW}⚠️  30일 이상 된 로그 파일 ${old_logs}개 발견${NC}"
  echo "   삭제하시겠습니까? (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    find . -name "*.log" -mtime +30 -delete
    echo -e "${GREEN}✅ ${old_logs}개의 오래된 로그 파일 제거됨${NC}"
    ((cleaned_items+=$old_logs))
  else
    echo "   로그 파일 유지"
  fi
else
  echo "   오래된 로그 파일 없음"
fi

# 5. node_modules 크기 확인
echo ""
echo "📦 node_modules 확인 중..."
if [ -d "node_modules" ]; then
  size=$(du -sh node_modules | cut -f1)
  echo -e "${YELLOW}ℹ️  node_modules 크기: ${size}${NC}"
  echo "   필요시 'npm ci' 또는 'npm install'로 재설치 가능"
fi

# 6. archive 폴더 크기 확인
echo ""
echo "🗄️ archive 폴더 확인 중..."
if [ -d "archive" ]; then
  size=$(du -sh archive | cut -f1)
  file_count=$(find archive -type f | wc -l)
  echo -e "   archive 폴더: ${size}, ${file_count}개 파일"

  # 3개월 이상 된 파일 확인
  old_archives=$(find archive -type f -mtime +90 | wc -l)
  if [ $old_archives -gt 0 ]; then
    echo -e "${YELLOW}⚠️  3개월 이상 된 아카이브 파일 ${old_archives}개 발견${NC}"
  fi
fi

# 7. 중복 파일 확인 (선택사항)
echo ""
echo "🔍 중복 파일 확인..."
# 간단한 중복 확인 (파일명 기준)
duplicates=$(find . -type f ! -path "./.git/*" -printf "%f\n" | sort | uniq -d | wc -l)
if [ $duplicates -gt 0 ]; then
  echo -e "${YELLOW}⚠️  동일한 이름의 파일이 여러 개 있을 수 있습니다${NC}"
  echo "   상세 확인이 필요합니다"
else
  echo -e "${GREEN}✅ 중복 파일명 없음${NC}"
fi

# 결과 요약
echo ""
echo "================================"
echo "🎯 정리 결과 요약"
echo "================================"

if [ $cleaned_items -eq 0 ]; then
  echo -e "${GREEN}✨ 이미 깔끔합니다! 정리할 항목이 없습니다.${NC}"
else
  echo -e "${GREEN}✅ 총 ${cleaned_items}개 항목 정리 완료${NC}"
fi

# 구조 검증 실행 제안
echo ""
echo "💡 팁: './check-structure.sh'를 실행하여 구조를 검증해보세요."

exit 0