# 복슬가계부
개발중인 프로젝트임

## 주요기능
- 계좌(통장, 카드, 주식 등) 등록 및 관리
- 다중 통화 관리
  - 환전
  - 환율이 적용된 자산 관리
- 주식 매매
  - 국내 주식 매매
  - 외국 주식 매매
- 달력 및 목록 방식 조회
- 자주쓰는 거래 내역 등록
- 년단위 기준 월 결산
- 결과 목록 엑셀 내보내기
- 분류 및 각종 코드관리
- 수입/지출/이체 내역 및 자산 변동 통계
  - 환율이 적용된 자산 가치 산출

## 실행 및 빌드

### 실행 방법
- `npm start`

### 빌드 방법 (인스톤 파일 생성)
- `npm run package`
- `release/build` 폴더에 생성됨

## 주요화면

## 개발환경
상세 버전은 [package.json](package.json)를 확인
- typescript
- electron
- react
- sqlite3
- [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)
- [React Bootstrap](https://react-bootstrap.netlify.app)
- [react-icons](https://react-icons.github.io/react-icons)
- [나눔글꼴](https://hangeul.naver.com/font/nanum)
- [Pretendard 글꼴](https://github.com/orioncactus/pretendard) 
- [FullCalendar](https://fullcalendar.io/)

## 문제 해결에 도움이 된 사이트

## 릴리즈

## 참고 사이트
- [디자인 템플릿](https://themewagon.com/themes/corona-free-responsive-bootstrap-4-admin-dashboard-template/)


## 개발팀
- main process 자동 실행 방지 방법 - package.json 수정
  - 수정전: `"start:main": "cross-env NODE_ENV=development electronmon -r ts-node/register/transpile-only ."`
  - 수정후: `"start:main": "cross-env NODE_ENV=development electron -r ts-node/register/transpile-only .","`
