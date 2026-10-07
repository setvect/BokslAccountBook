# 리팩토링 설계·검증 기록

## 테스트 기반

- 일반 테스트에서 개발 DB 대신 임시 SQLite 파일을 생성하고 종료 시 삭제한다. 서비스 import 시 생성되는 기본 DataSource도 `NODE_ENV=test`에서는 메모리 DB만 사용한다.
- `TransactionService`는 DataSource를 생성자로 받는다. 기존 호출부는 기본 인스턴스를 사용하고, 테스트는 독립 DB 인스턴스를 주입한다.
- 샘플 생성은 `npm run sample-data` 또는 개발 메뉴로만 실행한다. 일반 Jest 대상에서 제거했다.
- 초기 타입 검사 실패는 FullCalendar v5의 `common` 타입을 v6 UI에서 참조한 것이 원인이었다. 설치된 UI와 일치하는 `core` 타입으로 변경했고 라이브러리 타입 검사를 생략하지 않았다.

## IPC 전환

- 요청·응답은 `ipcRenderer.invoke` / `ipcMain.handle`을 사용한다. UUID 기반 수동 응답 채널과 리스너를 없애고 Electron이 요청을 연결하도록 한다.
- `src/common/ipc/Contract.ts`에서 채널별 인자와 반환값을 정의한다. renderer는 기존 `window.electron.ipcRenderer` 경유 구조를 유지한다.
- main은 입력 검증 오류와 서비스 오류를 구분해 `{ ok, value/error }`로 반환한다. renderer 공통 호출부는 실패를 `IpcRequestError`로 reject한다.
- 대기 시간은 30초다. 시간 초과가 DB 작업 취소를 뜻하지 않으며, 저장 요청을 자동 재시도하지 않는다. 늦게 도착한 응답도 소비해 미처리 rejection을 방지한다.
- 호출자가 오류를 처리하면 그 처리를 따르고, 처리하지 않은 IPC rejection만 App에서 한 번 안내한다. 새 요청 실패는 기존 공통 오류 이벤트로 중복 전송하지 않는다.
- 메뉴 등의 일방향 알림은 이벤트 구독 방식을 유지한다.
- 첫 적용은 분류 조회·등록·수정·정렬·삭제다. 다른 기능은 기존 방식을 유지하는 상태에서 분류 IPC + SQLite 테스트를 통과시켰다.

## 의도한 동작 변경

- IPC 실패 후 무기한 대기하던 호출은 실패로 종료된다. 응답이 없는 요청은 시간 초과 안내가 표시된다.
