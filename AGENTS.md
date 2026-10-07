# AGENTS.md

## 프로젝트 개요

- 이 저장소는 Electron 기반 데스크톱 가계부 앱 `복슬가계부`이다.
- 렌더러는 React 18 + TypeScript, 메인 프로세스는 Electron + TypeScript로 구성되어 있다.
- 데이터 저장소는 SQLite이며, ORM은 TypeORM을 사용한다.
- 프로젝트 초기 구성은 `electron-react-boilerplate` 기반이며 빌드 설정은 주로 `.erb/` 아래에 있다.

## 핵심 구조

- `src/main`
  - Electron main process 진입점, 메뉴, preload, IPC 등록, DB 초기화, 서비스/리포지토리/엔티티가 있다.
  - 구조는 대체로 `Entity -> Repository -> Service -> IpcHandler` 순서로 이어진다.
- `src/renderer`
  - React UI 코드가 있다.
  - 페이지 라우팅은 [`src/renderer/App.tsx`](/Users/boksl/IdeaProjects/BokslAccountBook/src/renderer/App.tsx), [`src/renderer/Main.tsx`](/Users/boksl/IdeaProjects/BokslAccountBook/src/renderer/Main.tsx)에서 시작한다.
  - IPC 호출은 [`src/renderer/common/IpcCaller.ts`](/Users/boksl/IdeaProjects/BokslAccountBook/src/renderer/common/IpcCaller.ts)에 모여 있다.
- `src/common`
  - main/renderer 공용 타입, 요청/응답 모델, IPC 채널 enum이 있다.
- `assets/init_data`
  - 최초 실행 시 DB에 넣는 초기 데이터 JSON이 있다.
- `assets/sample_data`
  - 개발용 샘플 데이터 관련 리소스가 있다.
- `db`
  - 개발 환경 SQLite DB 파일이 생성되는 위치다.
- `release/app`
  - `sqlite3`, `bcrypt`, `typeorm` 같은 네이티브/런타임 의존성이 따로 설치되는 영역이다.
- `.erb`
  - webpack 설정, 빌드/포트 체크/네이티브 의존성 스크립트가 있다.

## 실행 및 빌드

초기 설치는 두 군데 모두 필요하다.

```bash
npm install
cd release/app
npm install
```

주요 명령:

- `npm start`: 개발 실행
- `npm test`: Jest 테스트 실행
- `npm run lint`: ESLint 실행
- `npm run build`: main/renderer 프로덕션 빌드
- `npm run package`: 설치 파일 생성
- `npm run rebuild`: `release/app` 네이티브 모듈 rebuild

패키징 결과물은 `release/build/`에 생성된다.

## 데이터 및 로컬 상태

- 개발 환경 DB 경로는 `db/BokslAccountBook.db`다.
- 프로덕션 DB 경로는 Electron `userData` 경로 아래 `BokslAccountBook.db`다.
- DB 설정은 [`src/main/config/AppDataSource.ts`](/Users/boksl/IdeaProjects/BokslAccountBook/src/main/config/AppDataSource.ts)에 있다.
- 현재 TypeORM 설정은 `synchronize: true`다.
  - 엔티티 변경은 실제 사용자 DB 스키마에 직접 영향을 줄 수 있으므로 보수적으로 다뤄야 한다.
- 앱 최초 실행 시 기본 사용자와 코드/분류/계좌 초기 데이터가 자동 생성된다.
  - 기본 계정은 `boksl / boksl`
- 환율, 창 크기 같은 로컬 설정은 `electron-store`로 저장한다.

## 기능 변경 시 기본 흐름

새 기능이나 데이터 항목을 추가할 때는 아래 흐름을 우선 따른다.

1. 공용 타입과 IPC 채널이 필요하면 `src/common`을 먼저 수정한다.
2. DB 연관 변경이면 `Entity`, `Repository`, `Service`를 메인 프로세스에 추가/수정한다.
3. IPC 진입점은 [`src/main/IpcHandler.ts`](/Users/boksl/IdeaProjects/BokslAccountBook/src/main/IpcHandler.ts)에 연결한다.
4. 렌더러에서는 [`src/renderer/common/IpcCaller.ts`](/Users/boksl/IdeaProjects/BokslAccountBook/src/renderer/common/IpcCaller.ts)를 통해 호출한다.
5. UI는 기존 React Bootstrap 기반 패턴과 다크 테마 스타일을 우선 따른다.

중요:

- 렌더러에서 Node/Electron API를 직접 호출하지 말고 `window.electron.ipcRenderer` 경유 패턴을 유지한다.
- 단순 화면 수정이라도 IPC 응답 타입과 렌더러 모델 매핑이 깨지지 않는지 함께 확인한다.
- DB 필드 추가 시 초기 데이터 JSON, 샘플 데이터, 통계/합계 계산 로직 영향도 같이 점검한다.

## 테스트 및 검증 기준

- 작은 UI 변경: 관련 컴포넌트 렌더링과 타입 오류 확인
- IPC/서비스 변경: 최소 `npm test` 실행 고려
- 빌드/패키징 영향 변경: 가능하면 `npm run build` 또는 `npm run package`까지 확인
- 네이티브 모듈 문제나 설치 이슈가 보이면 `release/app` 의존성 설치 상태를 먼저 확인

현재 테스트는 많지 않으므로, 서비스 계층이나 통계 로직을 건드릴 때는 코드 리뷰만으로 끝내지 말고 실제 실행 검증을 우선한다.

## 샘플 데이터와 개발 편의 기능

- 개발 모드 메뉴의 `복슬가계부 -> 샘플 데이터 만들기`로 샘플 데이터를 생성할 수 있다.
- 또는 프로젝트 루트에서 `npm run sample-data`를 명시적으로 실행한다. 일반 테스트에서는 샘플 데이터를 생성하지 않는다.
- 샘플 데이터 생성은 현재 DB를 백업한 뒤 데이터를 교체하므로, 개발 DB를 쓰는 작업 중에는 주의한다.

## 수정 대상과 비대상

일반적으로 수정 대상:

- `src/**`
- `assets/**`
- `.erb/**`(빌드 설정이나 스크립트가 실제로 필요한 경우만)
- 문서 파일

일반적으로 직접 수정하지 말 것:

- `release/build/**`
- `release/app/dist/**`
- `node_modules/**`
- `release/app/node_modules/**`
- `.erb/dll/**`

예외:

- 의존성 변경이 있을 때만 `package.json`, `package-lock.json`, `release/app/package.json`, `release/app/package-lock.json`을 함께 갱신한다.
- `release/app`는 네이티브 런타임 의존성 영역이라, 여기의 `package.json` 변경은 루트 의존성과 목적이 다를 수 있음을 염두에 둔다.

## 작업 시 참고 문서

- [`README.md`](/Users/boksl/IdeaProjects/BokslAccountBook/README.md)
- [`doc/TABLE-SCHEMA.md`](/Users/boksl/IdeaProjects/BokslAccountBook/doc/TABLE-SCHEMA.md)
- [`RELEASE.md`](/Users/boksl/IdeaProjects/BokslAccountBook/RELEASE.md)
- [`TODO.md`](/Users/boksl/IdeaProjects/BokslAccountBook/TODO.md)

## 작업 원칙

- 기존 파일 배치와 역할 분리를 유지한다.
- main process 로직은 서비스 계층에, renderer는 UI와 사용자 상호작용에 집중시킨다.
- 타입 안정성을 해치지 않는 방향으로 수정한다.
- 생성물보다 소스 파일을 수정한다.
- 사용자 데이터가 들어가는 DB/비밀번호/스토어 관련 변경은 특히 보수적으로 다룬다.
