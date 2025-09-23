# 🔄 롤백 가이드 - v13.3.4-stable

## 📌 현재 안정 버전 정보
- **버전**: v13.3.4-stable
- **태그 날짜**: 2025-09-23
- **커밋 해시**: 저장됨
- **백업 브랜치**: backup-v13.3.4

## 🚨 롤백이 필요한 경우

대규모 패치 후 다음과 같은 문제가 발생하면 롤백을 고려하세요:
- 핵심 기능 작동 불가
- 데이터 손실 발생
- 심각한 성능 저하
- 배포 실패

## 📋 롤백 방법

### 방법 1: 태그로 직접 롤백 (권장)
```bash
# 현재 작업 내용 백업 (선택사항)
git stash

# 태그로 체크아웃
git checkout v13.3.4-stable

# 새 브랜치 생성 (선택사항)
git checkout -b hotfix-from-stable
```

### 방법 2: 백업 브랜치 사용
```bash
# 백업 브랜치로 전환
git checkout backup-v13.3.4

# master에 강제 적용하려면
git checkout master
git reset --hard backup-v13.3.4
```

### 방법 3: 특정 커밋으로 롤백
```bash
# 커밋 히스토리 확인
git log --oneline -10

# 특정 커밋으로 롤백
git reset --hard 749af97  # v13.3.4-stable 커밋
```

### 방법 4: Revert 사용 (기록 보존)
```bash
# 최근 커밋들을 되돌리기
git revert HEAD~3..HEAD  # 최근 3개 커밋 되돌리기
```

## 🔧 롤백 후 조치

### 1. 로컬 테스트
```bash
# 브라우저에서 로컬 테스트
# index.html 열어서 기능 확인
```

### 2. 원격 저장소 업데이트
```bash
# 강제 푸시 (주의!)
git push origin master --force

# 또는 새 브랜치로 푸시
git push origin hotfix-from-stable
```

### 3. GitHub Pages 캐시 초기화
```bash
# 빈 커밋으로 재배포 트리거
git commit --allow-empty -m "chore: trigger redeploy after rollback"
git push origin master
```

## 📊 안정 버전 기능 체크리스트

### ✅ 검증된 기능들
- [x] SSE 실시간 핸드 감지
- [x] Google Sheets 연동
- [x] AI 분석 (Gemini API)
- [x] 파일명 자동 생성
- [x] J열 자막 생성 (CURRENT STACK 포함)
- [x] 상태 관리 (편집/완료)
- [x] Apps Script 통신

### 📁 파일 구조
```
virtual_table_db_claude/
├── index.html (419KB)
├── sse-client.js
├── src/modules/
│   ├── filename-manager.js
│   ├── ai-analyzer.js
│   └── filename-adapter.js
├── scripts/appScripts.gs
└── docs/checklist.md
```

## 🆘 긴급 복구 명령어

### 완전 초기화 및 복구
```bash
# 모든 변경사항 버리고 안정 버전으로
git fetch origin
git reset --hard v13.3.4-stable
git clean -fd
```

### 특정 파일만 복구
```bash
# index.html만 복구
git checkout v13.3.4-stable -- index.html

# 전체 src 폴더 복구
git checkout v13.3.4-stable -- src/
```

## 📝 참고사항

1. **백업 확인**: 롤백 전 현재 작업 백업
2. **팀 공지**: 롤백 시 팀원들에게 알림
3. **원인 분석**: 롤백 후 문제 원인 분석
4. **점진적 패치**: 대규모 변경보다 작은 단위로 패치

## 🔍 버전 확인 방법

### 현재 버전 확인
```bash
# 태그 목록
git tag -l

# 현재 브랜치
git branch

# 현재 커밋
git log --oneline -1
```

### 원격 저장소 상태 확인
```bash
git fetch origin
git status
```

---

**중요**: 이 가이드는 v13.3.4-stable 버전 기준입니다.
대규모 패치 전 이 문서를 참고하여 필요시 신속하게 롤백하세요.