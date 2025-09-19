# 📁 Virtual Table DB - 프로젝트 구조 관리 가이드

## 🎯 목적
이 문서는 Virtual Table DB 프로젝트의 일관된 파일 구조와 관리 규칙을 정의합니다.

## 📂 표준 폴더 구조

```
virtual_table_db_claude/
│
├── 📄 index.html              # 메인 애플리케이션 (루트에 유지 - GitHub Pages)
├── 📄 README.md               # 프로젝트 소개 및 설치 가이드
├── 📄 PROJECT_STRUCTURE.md    # 본 문서 - 구조 관리 가이드
├── 📄 _config.yml            # GitHub Pages 설정
├── 📄 .gitignore             # Git 제외 파일
│
├── 📁 src/                   # 소스 코드
│   ├── 📁 core/             # 핵심 비즈니스 로직
│   │   ├── hand-analyzer.js
│   │   ├── sheet-manager.js
│   │   └── cache-system.js
│   ├── 📁 scripts/          # 스크립트 파일
│   │   ├── apps_script.gs   # Google Apps Script
│   │   └── main.js         # 메인 JavaScript
│   ├── 📁 styles/          # 스타일 파일
│   │   ├── main.css
│   │   └── components.css
│   ├── 📁 components/      # UI 컴포넌트
│   │   ├── hand-card.js
│   │   └── dashboard.js
│   └── 📁 utils/          # 유틸리티 함수
│       ├── time-utils.js
│       └── api-helper.js
│
├── 📁 config/             # 설정 파일
│   ├── default.json
│   ├── production.json
│   └── development.json
│
├── 📁 tests/             # 테스트 파일
│   ├── 📁 unit/         # 단위 테스트
│   │   └── *.test.js
│   └── 📁 integration/  # 통합 테스트
│       └── *.spec.js
│
├── 📁 docs/              # 문서
│   ├── README.md        # 프로젝트 문서
│   ├── CHECKLIST.md     # 개발 체크리스트
│   ├── API.md          # API 문서
│   └── CHANGELOG.md    # 변경 이력
│
├── 📁 assets/           # 정적 자원
│   ├── 📁 images/      # 이미지 파일
│   ├── 📁 icons/       # 아이콘 파일
│   └── 📁 fonts/       # 폰트 파일
│
├── 📁 archive/          # 아카이브 (버전 관리는 하지만 빌드에서 제외)
│   ├── 📁 old_tests/   # 이전 테스트 파일
│   └── 📁 deprecated/  # 더 이상 사용하지 않는 코드
│
├── 📁 .github/          # GitHub 설정
│   └── 📁 workflows/   # GitHub Actions
│
└── 📁 .claude/          # Claude AI 설정 (건드리지 않음)
    ├── 📁 agents/      # AI 에이전트 설정
    └── 📁 commands/    # AI 커맨드 설정
```

## 📋 파일 명명 규칙

### 1. **일반 규칙**
- 소문자와 하이픈(-) 사용: `hand-analyzer.js`
- 언더스코어(_)는 특별한 경우만: `_config.yml`
- 확장자 명확히: `.js`, `.css`, `.md`

### 2. **파일 타입별 규칙**

| 타입 | 명명 규칙 | 예시 |
|------|----------|------|
| **JavaScript** | kebab-case | `sheet-manager.js` |
| **CSS** | kebab-case | `main-styles.css` |
| **테스트** | 원본명.test/spec | `cache-system.test.js` |
| **문서** | UPPERCASE | `README.md`, `CHANGELOG.md` |
| **설정** | lowercase | `config.json`, `.gitignore` |
| **컴포넌트** | PascalCase 가능 | `HandCard.jsx` (React) |

### 3. **버전 관리**
- 버전 번호는 파일명에 포함하지 않음
- Git 태그와 브랜치로 관리
- 예: ~~`index-v2.html`~~ → `index.html` + Git 태그 `v2.0.0`

## 🔄 파일 이동 규칙

### 새 파일 추가 시

```bash
# 1. 파일 타입 확인
# 2. 적절한 폴더 선택
# 3. 명명 규칙 따르기

# 예시: 새로운 유틸리티 함수 추가
touch src/utils/date-formatter.js

# 예시: 새로운 테스트 추가
touch tests/unit/date-formatter.test.js

# 예시: 새로운 문서 추가
touch docs/DEPLOYMENT.md
```

### 기존 파일 정리 시

```bash
# 1. 더 이상 사용하지 않는 파일 → archive/deprecated/
mv old-component.js archive/deprecated/

# 2. 오래된 테스트 → archive/old_tests/
mv outdated.test.js archive/old_tests/

# 3. 임시 파일 → 즉시 삭제 또는 .gitignore 추가
rm temp-*.js
```

## 🚫 하지 말아야 할 것들

### ❌ 금지 사항
1. **루트에 무분별한 파일 생성**
   - ❌ `test1.html`, `backup.js`, `temp.txt`

2. **버전 번호를 파일명에 포함**
   - ❌ `index-v2-final-final.html`
   - ✅ Git 태그 사용: `git tag v2.0.0`

3. **개인 설정 파일 커밋**
   - ❌ `.env.local`, `config.personal.js`
   - ✅ `.gitignore`에 추가

4. **대용량 파일 직접 커밋**
   - ❌ 10MB 이상 파일
   - ✅ Git LFS 사용 또는 외부 저장소 링크

## ✅ 체크리스트

### 일일 작업 시
- [ ] 새 파일이 올바른 폴더에 있는지 확인
- [ ] 파일명이 명명 규칙을 따르는지 확인
- [ ] 사용하지 않는 파일은 archive로 이동
- [ ] .gitignore 업데이트 필요한지 확인

### 주간 정리
- [ ] archive 폴더 정리 (3개월 이상 된 파일 삭제 검토)
- [ ] 중복 파일 제거
- [ ] 문서 최신화
- [ ] 폴더 구조 리뷰

### 릴리즈 전
- [ ] 불필요한 테스트 파일 정리
- [ ] 문서 완성도 확인
- [ ] 파일 구조 문서 업데이트
- [ ] README.md 구조 섹션 업데이트

## 🛠️ 자동화 스크립트

### 구조 검증 스크립트
```bash
#!/bin/bash
# check-structure.sh

echo "🔍 프로젝트 구조 검증 중..."

# 필수 폴더 확인
required_dirs=("src" "docs" "tests" "config" "assets")
for dir in "${required_dirs[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "❌ 필수 폴더 누락: $dir"
    exit 1
  fi
done

# 루트 레벨 파일 수 확인
root_files=$(find . -maxdepth 1 -type f | wc -l)
if [ $root_files -gt 10 ]; then
  echo "⚠️  경고: 루트 디렉토리에 파일이 너무 많습니다 ($root_files개)"
fi

echo "✅ 구조 검증 완료"
```

### 파일 정리 스크립트
```bash
#!/bin/bash
# cleanup.sh

echo "🧹 프로젝트 정리 시작..."

# 임시 파일 제거
find . -name "*.tmp" -o -name "*.temp" -o -name "*~" | xargs rm -f

# 빈 폴더 제거
find . -type d -empty -delete

# .DS_Store 제거 (macOS)
find . -name ".DS_Store" -delete

echo "✅ 정리 완료"
```

## 📊 구조 모니터링

### VS Code 설정 (.vscode/settings.json)
```json
{
  "files.exclude": {
    "**/archive": true,
    "**/.git": true,
    "**/node_modules": true,
    "**/.DS_Store": true
  },
  "search.exclude": {
    "**/archive": true,
    "**/node_modules": true
  },
  "files.associations": {
    "*.gs": "javascript"
  }
}
```

## 🔗 관련 문서
- [README.md](./README.md) - 프로젝트 소개
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - 기여 가이드
- [CHANGELOG.md](./docs/CHANGELOG.md) - 변경 이력

## 📝 유지보수 담당
- 구조 관리: 프로젝트 리드
- 문서 업데이트: 모든 기여자
- 검토 주기: 매주 금요일

---

**최종 수정일**: 2025-09-18
**버전**: v1.0.0
**작성자**: Claude AI & Development Team