# Notion Todo Widget

노션 페이지에 `/embed`로 넣을 수 있는 개인용 투두 위젯입니다.

## 기능

- 오늘 날짜 기준 투두 표시
- 할 일 추가
- 완료 체크
- 중요 표시
- 삭제 시 Notion 페이지 archive 처리
- Notion Database 저장
- Vercel 배포용 Next.js App Router 프로젝트

## Notion Database 속성

노션 DB에 아래 속성을 정확히 만들어야 합니다.

| 속성 이름 | 타입 |
| --- | --- |
| Name | Title |
| Date | Date |
| Done | Checkbox |
| Important | Checkbox |
| Order | Number |

속성 이름이 하나라도 다르면 저장/조회가 실패할 수 있습니다.

## Notion Integration 연결

1. Notion Developers에서 Integration을 만듭니다.
2. Integration Secret을 복사합니다.
3. 노션 Todo DB 페이지 오른쪽 위 `...`를 누릅니다.
4. `Connections` 또는 `Add connections`에서 방금 만든 Integration을 연결합니다.

## 환경변수

Vercel 프로젝트 설정의 Environment Variables에 아래 2개를 넣습니다.

```env
NOTION_TOKEN=ntn_...으로 시작하는 Notion Integration Secret
NOTION_DATABASE_ID=노션 Todo DB ID
```

## 로컬 실행

```bash
npm install
npm run dev
```

로컬에서 테스트하려면 `.env.local` 파일을 만들고 아래처럼 넣습니다.

```env
NOTION_TOKEN=ntn_...으로 시작하는 Notion Integration Secret
NOTION_DATABASE_ID=노션 Todo DB ID
```

## Vercel 배포

1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. Vercel에서 `Add New Project`를 누릅니다.
3. GitHub 저장소를 선택합니다.
4. Environment Variables에 `NOTION_TOKEN`, `NOTION_DATABASE_ID`를 넣습니다.
5. Deploy를 누릅니다.

환경변수를 나중에 추가하거나 수정했다면 `Redeploy`를 해야 적용됩니다.

## Notion에 넣기

1. Vercel 배포 주소를 복사합니다.
2. 노션 페이지에서 `/embed`를 입력합니다.
3. 배포 주소를 붙여넣습니다.
4. 위젯 크기를 조절합니다.

## 자주 나는 오류

| 에러 | 원인 | 해결 |
| --- | --- | --- |
| Missing NOTION_TOKEN | 환경변수 없음 | Vercel 환경변수 확인 후 Redeploy |
| object_not_found | DB에 Integration 연결 안 됨 | DB 페이지에서 Connections 추가 |
| property not found | DB 속성 이름 다름 | Name, Date, Done, Important, Order 확인 |
| Unauthorized | Token 오류 | Notion Integration Secret 다시 확인 |
| 화면은 뜨는데 저장 안 됨 | 환경변수/DB 권한 문제 | Vercel 로그 확인 |
redeploy test
