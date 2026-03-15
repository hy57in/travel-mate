---
description: 프로젝트 현재 상태를 요약
allowed-tools: Bash(wc:*), Bash(grep:*), Bash(find:*)
---

다음을 실행하고 결과를 정리해줘:

1. 파일 구조:
!`find src/ -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" | head -30`

2. 각 파일 줄 수:
!`find src/ -name "*.jsx" -o -name "*.js" | xargs wc -l 2>/dev/null | sort -rn | head -15`

3. 디자인 토큰 위반 수:
!`grep -rn "gap: [0-9]\|padding: [0-9]\|margin.*: [0-9]" src/ --include="*.jsx" 2>/dev/null | grep -v "S\." | wc -l`

4. TODO/FIXME:
!`grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.jsx" 2>/dev/null`

결과를 다음 형태로 보고:
- 총 파일 수 / 총 줄 수
- 200줄 초과 파일 (분리 필요)
- 토큰 위반 수
- 미완료 작업 (TODO)
