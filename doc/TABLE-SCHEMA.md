# 복슬가계부 - 테이블 설계

## 1. 회원관리

### 1.1. AA_USER: 회원

| Column Name | Attribute Name | Key | Type    | Len | Not Null | Description |
| ----------- | -------------- | --- | ------- | --- | -------- | ----------- |
| USER_ID     | 아아디         | PK  | varchar | 20  | N        |             |
| NAME        | 이름           |     | varchar | 50  | N        |             |
| PASSWD      | 비밀번호       |     | varchar | 60  | N        |             |
| DELETE_F    | 삭제 여부      |     | boolean | 1   | false    |             |

## 2. 계좌 및 거래 내역

### 2.1. BA_ACCOUNT: 계좌정보

| Column Name    | Attribute Name | Key | Type    | Len  | Not Null | Description                                                                 |
| -------------- | -------------- | --- | ------- | ---- | -------- | --------------------------------------------------------------------------- |
| ACCOUNT_SEQ    | 계좌 일련번호  | PK  | integer |      | Y        |                                                                             |
| NAME           | 이름           |     | varchar | 100  | Y        |                                                                             |
| ACCOUNT_NUMBER | 계좌번호       |     | varchar | 100  |          |                                                                             |
| ASSET_TYPE     | 자산종류       |     | integer |      | Y        | ZB_CODE_ITEM.CODE_ITEM_SEQ<br>코드 값 ASSET_TYPE<br>신용카드, 통장, 지갑 등 |
| ACCOUNT_TYPE   | 계좌성격       |     | integer |      | Y        | ZB_CODE_ITEM.CODE_ITEM_SEQ<br>코드 값 TYPE_ACCOUNT<br>고정자산, 투자자산 등 |
| INTEREST_RATE  | 이율           |     | varchar | 100  |          |                                                                             |
| TERM           | 계약기간       |     | varchar | 100  |          |                                                                             |
| EXP_DATE       | 만기일         |     | varchar | 100  |          |                                                                             |
| MONTHLY_PAY    | 월 납입액      |     | varchar | 100  |          |                                                                             |
| TRANSFER_DATE  | 이체일         |     | varchar | 100  |          |                                                                             |
| NOTE           | 메모 내용      |     | varchar | 1000 |          |                                                                             |
| ENABLE_F       | 활성 여부      |     | varchar | 1    | Y        |                                                                             |
| STOCK_F        | 주식 게좌 여부 |     | boolean | 1    | false    |                                                                             |
| DELETE_F       | 삭제 여부      |     | boolean | 1    | false    |                                                                             |

### 2.2. BB_BALANCE: 잔고

| Column Name | Attribute Name | Key | Type    | Len | Not Null | Description        |
| ----------- | -------------- | --- | ------- | --- | -------- | ------------------ |
| BALANCE_SEQ | 잔고 일련번호  | PK  | integer |     | Y        |                    |
| ACCOUNT_SEQ | 계좌 일련번호  | FK  | integer |     | Y        | BA_ACCOUNT 외래키  |
| CURRENCY    | 통화 코드      |     | varchar | 3   | Y        | KRW, USD, JPY, ... |
| AMOUNT      | 금액           |     | real    |     | Y        |                    |

### 2.3. BC_CATEGORY: 거래 분류

| Column Name  | Attribute Name   | Key | Type    | Len | Not Null | Description                 |
| ------------ | ---------------- | --- | ------- | --- | -------- | --------------------------- |
| CATEGORY_SEQ | 아이템 일련번호  | PK  | integer |     | Y        |                             |
| KIND         | 유형             |     | varchar | 20  | Y        | INCOME, SPENDING, TRANSFER  |
| NAME         | 항목이름         |     | varchar | 100 | Y        |                             |
| PARENT_SEQ   | 부모항목 번호    |     | integer |     |          | 최대 2단계로만 함 기본값: 0 |
| ORDER_NO     | 항목내 정렬 순서 |     | integer |     | Y        |                             |
| DELETE_F     | 삭제 여부        |     | boolean | 1   | false    |                             |

### 2.4. BD_FAVORITE: 자주 쓰는 항목

| Column Name     | Attribute Name          | Key | Type    | Len | Not Null   | Description                                                                                                                                                                |
| --------------- | ----------------------- | --- | ------- | --- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FAVORITE_SEQ    | 자주 쓰는 항목 일련번호 | PK  | integer |     | Y          |                                                                                                                                                                            |
| CATEGORY_SEQ    | 항목 일련번호           | FK  | integer |     | Y          | BC_CATEGORY 외래키                                                                                                                                                         |
| KIND            | 유형                    |     | varchar | 20  | Y          | INCOME, SPENDING, TRANSFER                                                                                                                                                 |
| TITLE           | 거래 제목               |     | varchar | 200 | Y          |                                                                                                                                                                            |
| PAY_ACCOUNT     | 출금계좌                |     | integer |     |            | BA_ACCOUNT 논리적 외래키                                                                                                                                                   |
| RECEIVE_ACCOUNT | 입금계좌                |     | integer |     |            | BA_ACCOUNT 논리적 외래키                                                                                                                                                   |
| AMOUNT          | 금액                    |     | real    |     | KRW만 입력 |                                                                                                                                                                            |
| NOTE            | 항목 설명               |     | varchar | 200 |            |                                                                                                                                                                            |
| ATTRIBUTE       | 속성                    |     | integer |     |            | ZB_CODE_ITEM.CODE_ITEM_SEQ <br/>코드 값 <br/>지출: SPENDING_ATTR 고정지출, 단순지출, <br/>이체: TRANSFER_ATTR 단순이체, 투자이체 <br>수입: INCOME_ATTR 단순 수입,투자 수입 |
| ORDER_NO        | 항목내 정렬 순서        |     | integer |     | Y          |                                                                                                                                                                            |
| DELETE_F        | 삭제 여부               |     | boolean | 1   | false      |                                                                                                                                                                            |

### 2.5. BE_MEMO: 메모

| Column Name | Attribute Name | Key | Type    | Len  | Not Null | Description |
| ----------- | -------------- | --- | ------- | ---- | -------- | ----------- |
| MEMO_SEQ    | 메모 일련번호  | PK  | integer |      | Y        |             |
| NOTE        | 메모 내용      |     | varchar | 1000 | Y        |             |
| MEMO_DATE   | 메모 일        |     | date    |      | Y        |             |
| DELETE_F    | 삭제 여부      |     | boolean | 1    | false    |             |

### 2.6. BF_TRANSACTION: 거래 내역

| Column Name      | Attribute Name | Key | Type    | Len | Not Null | Description                                                                                                                                                                |
| ---------------- | -------------- | --- | ------- | --- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TRANSACTION_SEQ  | 내역 일련번호  | PK  | integer |     | Y        |                                                                                                                                                                            |
| CATEGORY_SEQ     | 항목 일련번호  | FK  | integer |     | Y        | BB_CATEGORY 외래키                                                                                                                                                         |
| KIND             | 유형           |     | varchar | 20  | Y        | INCOME, SPENDING, TRANSFER                                                                                                                                                 |
| PAY_ACCOUNT      | 출금계좌       |     | integer |     |          | BA_ACCOUNT 논리적 외래키                                                                                                                                                   |
| RECEIVE_ACCOUNT  | 입금계좌       |     | integer |     |          | BA_ACCOUNT 논리적 외래키                                                                                                                                                   |
| ATTRIBUTE        | 속성           |     | integer |     |          | ZB_CODE_ITEM.CODE_ITEM_SEQ <br/>코드 값 <br/>지출: SPENDING_ATTR 고정지출, 단순지출, <br/>이체: TRANSFER_ATTR 단순이체, 투자이체 <br>수입: INCOME_ATTR 단순 수입,투자 수입 |
| AMOUNT           | 금액           |     | real    |     | Y        | KRW만 입력                                                                                                                                                                 |
| TRANSACTION_DATE | 사용일         |     | date    |     | Y        |                                                                                                                                                                            |
| NOTE             | 메모 내용      |     | varchar | 100 | Y        |                                                                                                                                                                            |
| FEE              | 수수료         |     | real    |     | Y        | KRW만 입력                                                                                                                                                                 |


## 3. 주식

### 3.1. CA_STOCK: 주식 종목

| Column Name     | Attribute Name | Key | Type    | Len  | Not Null | Description                                                               |
| --------------- | -------------- | --- | ------- | ---- | -------- | ------------------------------------------------------------------------- |
| STOCK_SEQ       | 일련번호       | PK  | integer |      | Y        |                                                                           |
| NAME            | 이름           |     | varchar | 100  | Y        |                                                                           |
| CURRENCY        | 통화 코드      |     | varchar | 3    | Y        | KRW, USD, JPY, ...                                                        |
| STOCK_TYPE_CODE | 주식 종류      |     | integer |      | Y        | ZB_CODE_ITEM.CODE_ITEM_SEQ<br>코드 값 TYPE_STOCK<br>개별종목, 지수 ETF 등 |
| NATION_CODE     | 상장국가       |     | integer |      | Y        | ZB_CODE_ITEM.TYPE_NATION<br>코드 값 TYPE_NATION<br>국내, 미국 등          |
| LINK            | 상세정보 링크  |     | varchar | 200  |          |                                                                           |
| NOTE            | 메모 내용      |     | varchar | 1000 |          |                                                                           |
| ENABLE_F        | 활성 여부      |     | boolean | 1    | false    |                                                                           |
| DELETE_F        | 삭제 여부      |     | boolean | 1    | false    |                                                                           |

### 3.2. CB_STOCK_BUY: 매수 주식 종목

| Column Name     | Attribute Name    | Key | Type    | Len | Not Null | Description       |
| --------------- | ----------------- | --- | ------- | --- | -------- | ----------------- |
| STOCK_BUY_SEQ   | 일련번호          | PK  | integer |     | Y        |                   |
| STOCK_SEQ       | 주식종목 일련번호 | PK  | integer |     | Y        | DA_STOCK 외래키   |
| ACCOUNT_SEQ     | 연결 계좌         | FK  | integer |     | Y        | BA_ACCOUNT 외래키 |
| QUANTITY        | 수량              |     | integer |     | Y        |                   |
| PURCHASE_AMOUNT | 매수금액          |     | real    |     | Y        |                   |
| DELETE_F        | 삭제 여부         |     | boolean | 1   | false    |                   |

### 3.3. CC_TRADING: 매매
금액 통화는 `DA_STOCK.CURRENCY` 기준

| Column Name   | Attribute Name      | Key | Type    | Len | Not Null | Description         |
| ------------- | ------------------- | --- | ------- | --- | -------- | ------------------- |
| TRADING_SEQ   | 일련번호            | PK  | integer |     | Y        |                     |
| STOCK_BUY_SEQ | 매수 주식 종목 주식 | FK  | integer |     | Y        | DB_STOCK_BUY 외래키 |
| NOTE          | 메모 내용           |     | varchar | 100 | Y        |                     |
| KIND          | 유형                |     | varchar | 20  | Y        | BUY, SELL           |
| TRADING_DATE  | 매매일              |     | date    |     | Y        |                     |
| PRICE         | 가격                |     | real    |     | Y        |                     |
| QUANTITY      | 수량                |     | integer |     | N        |                     |
| TAX           | 세금                |     | real    |     | N        |                     |
| FEE           | 수수료              |     | real    |     | N        |                     |
| SELL_GAINS    | 매도차익            |     | real    |     | N        |                     |

## 4. 환전
### 4.1. DA_EXCHANGE: 환전 내역

| Column Name   | Attribute Name | Key | Type    | Len | Not Null | Description        |
| ------------- | -------------- | --- | ------- | --- | -------- | ------------------ |
| EXCHANGE_SEQ  | 일련번호       | PK  | integer |     | Y        |                    |
| ACCOUNT_SEQ   | 계좌 일련번호  | FK  | integer |     | Y        | BA_ACCOUNT 외래키  |
| SELL_CURRENCY | 매도 통화 코드 |     | varchar | 3   | Y        | KRW, USD, JPY, ... |
| SELL_PRICE    | 매도 금액      |     | real    |     | Y        |                    |
| BUY_CURRENCY  | 매수 통화 코드 |     | varchar | 3   | Y        | KRW, USD, JPY, ... |
| BUY_PRICE     | 매수 금액      |     | real    |     | Y        |                    |
| FEE           | 수수료         |     | real    |     | N        | KRW 기준           |
| EXCHANGE_DATE | 환전일         |     | date    |     | Y        |                    |


## 5. 자산 스냅샷

### 5.1. EA_SNAPSHOT: 자산 스냅샷

| Column Name           | Attribute Name   | Key | Type    | Len | Not Null | Description                                          |
| --------------------- | ---------------- | --- | ------- | --- | -------- | ---------------------------------------------------- |
| SNAPSHOT_SEQ          | 일련번호         | PK  | integer |     | Y        |                                                      |
| NOTE                  | 메모 내용        |     | varchar | 100 | Y        |                                                      |
| STOCK_SELL_CHECK_DATE | 주식 매도 체크일 |     | date    |     | N        | 해당일 부터 스냅샷 등록일 사이 주식 매도는 손익 판단 |
| REG_DATE              | 작성일           |     | date    |     | Y        |                                                      |
| DELETE_F              | 삭제 여부        |     | boolean | 1   | false    |                                                      |

### 5.2. EB_EXCHANGE_RATE: KRW 대비 환율

| Column Name       | Attribute Name  | Key | Type    | Len | Not Null | Description        |
| ----------------- | --------------- | --- | ------- | --- | -------- | ------------------ |
| EXCHANGE_RATE_SEQ | 일련번호        | PK  | integer |     | Y        |                    |
| SNAPSHOT_SEQ      | 스냅샷 일련번호 | FK  | integer |     | Y        | FA_SNAPSHOT 외래키 |
| CURRENCY          | 통화            |     | varchar | 3   | Y        | USD, JPY, ...      |
| RATE              | 환율            |     | real    |     | Y        | KRW 대비           |

### 5.3. EB_ASSET_GROUP: 계좌성격별 그룹

| Column Name     | Attribute Name  | Key | Type    | Len | Not Null | Description                                                                 |
| --------------- | --------------- | --- | ------- | --- | -------- | --------------------------------------------------------------------------- |
| ASSET_GROUP_SEQ | 일련번호        | PK  | integer |     | Y        |                                                                             |
| SNAPSHOT_SEQ    | 스냅샷 일련번호 | FK  | integer |     | Y        | FA_SNAPSHOT 외래키                                                          |
| ACCOUNT_TYPE    | 계좌성격        |     | integer |     | Y        | ZB_CODE_ITEM.CODE_ITEM_SEQ<br>코드 값 TYPE_ACCOUNT<br>고정자산, 투자자산 등 |
| TOTAL_AMOUNT    | 합산 금액       |     | integer |     | Y        | KRW 표현, 계좌에 외국 통화는 환율 계산해서 입력                             |
| EVALUATE_AMOUNT | 평가 금액       |     | integer |     | Y        | KRW 표현, 계좌에 외국 통화는 환율 계산해서 입력                             |

### 5.4. EC_STOCK_EVALUATE: 주식 종목

| Column Name        | Attribute Name  | Key | Type    | Len | Not Null | Description         |
| ------------------ | --------------- | --- | ------- | --- | -------- | ------------------- |
| STOCK_EVALUATE_SEQ | 일련번호        | PK  | integer |     | Y        |                     |
| SNAPSHOT_SEQ       | 스냅샷 일련번호 | FK  | integer |     | Y        | FA_SNAPSHOT 외래키  |
| STOCK_SEQ          | 관련 주식       | FK  | integer |     | Y        | DB_STOCK_BUY 외래키 |
| BUY_AMOUNT         | 매수 금액       |     | real    |     | Y        |                     |
| EVALUATE_AMOUNT    | 평가 금액       |     | real    |     | Y        |                     |

## 6. 코드

### 6.1. ZA_CODE_MAIN: 메인코드

| Column Name  | Attribute Name | Key | Type    | Len | Not Null | Description                                                                                                                                                      |
| ------------ | -------------- | --- | ------- | --- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CODE_MAIN_ID | 매인 코드 값   | PK  | varchar | 20  | Y        | 자산유형: ASSET_TYPE<br/>지출항목: SPENDING_ATTR<br/>이체항목: TRANSFER_ATTR<br/>수입항목: INCOME_ATTR<br/> 주식종류: TYPE_STOCK<br/>계좌성격: TYPE_ACCOUNT<br/> |
| NAME         | 코드 이름      |     | varchar | 100 | Y        |                                                                                                                                                                  |
| DELETE_F     | 삭제 여부      |     | boolean | 1   | false    |                                                                                                                                                                  |

### 6.2. ZB_CODE_ITEM: 코드 항목값

| Column Name   | Attribute Name               | Key | Type    | Len | Not Null | Description                    |
| ------------- | ---------------------------- |-----| ------- | --- | -------- | ------------------------------ |
| CODE_ITEM_SEQ | 일련번호       | PK  | integer |     | Y        | 다른 테이블에서 값으로 사용됨. |
| CODE_MAIN_ID  | 매인 코드 값                 | FK  | varchar | 20  | Y        | ZA_CODE_MAIN 외래키            |
| NAME          | 코드 이름                    |     | varchar | 100 | Y        | 한글로된 설명                  |
| ORDER_NO      | 메인 코드 내 항목들간의 순서 |     | integer |     | Y        |                                |
| DELETE_F      | 삭제 여부                    |     | boolean | 1   | false    |                                |
