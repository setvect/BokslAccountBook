import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import React, { useRef, useState } from 'react';
import moment from 'moment';
import CalendarPart, { CalendarPartMethods } from './calendar/CalendarPart';
import { AccountProperties, AccountType, Currency, CurrencyProperties } from './common/BokslTypes';

// 이벤트 객체에 icon 속성을 추가하기 위한 인
function LedgerCalendar(): React.ReactElement {
  const [selectDate, setSelectDate] = useState<Date | null>(new Date());
  const handleChangeDate = (newSelectDate: Date) => {
    setSelectDate(newSelectDate);
  };

  const calendarPartRef = useRef<CalendarPartMethods>(null);
  const reloadLedger = () => {
    calendarPartRef.current?.reloadLedger();
  };

  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>가계부 쓰기(달력)</h2>
      <Row>
        <CalendarPart onChangeDate={handleChangeDate} ref={calendarPartRef} />
        <Col>
          <h4>{moment(selectDate).format('YYYY년 MM월 DD일')} 내역</h4>
          <Button onClick={reloadLedger}>현재 달 다시 계산</Button>
          <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
            <thead>
              <tr>
                <th>유형</th>
                <th>분류</th>
                <th>내용</th>
                <th>금액</th>
                <th>출금계좌</th>
                <th>입금계좌</th>
                <th>기능</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: AccountProperties[AccountType.EXPENSE].color }}>지출</td>
                <td>교통비 &gt; 대중교통비</td>
                <td>전철비</td>
                <td className="right">10,000</td>
                <td>[카드]복슬카드</td>
                <td>&nbsp;</td>
                <td style={{ textAlign: 'center' }}>
                  <ButtonGroup size="sm">
                    <Button className="small-text-button" variant="secondary">
                      수정
                    </Button>
                    <Button className="small-text-button" variant="light">
                      삭제
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td style={{ color: AccountProperties[AccountType.INCOME].color }}>수입</td>
                <td>기타소득 &gt; 불로소득</td>
                <td>복권당첨</td>
                <td className="right">3,100,000,000</td>
                <td>&nbsp;</td>
                <td>복슬통장</td>
                <td style={{ textAlign: 'center' }}>
                  <ButtonGroup size="sm">
                    <Button className="small-text-button" variant="secondary">
                      수정
                    </Button>
                    <Button className="small-text-button" variant="light">
                      삭제
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td style={{ color: AccountProperties[AccountType.TRANSFER].color }}>이체</td>
                <td>대체거래 &gt; 계좌이체</td>
                <td>카드값</td>
                <td className="right">1,000,000</td>
                <td>복슬통장</td>
                <td>복슬카드</td>
                <td style={{ textAlign: 'center' }}>
                  <ButtonGroup size="sm">
                    <Button className="small-text-button" variant="secondary">
                      수정
                    </Button>
                    <Button className="small-text-button" variant="light">
                      삭제
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            </tbody>
          </Table>
          <h4>{moment(selectDate).format('YYYY년 MM월 DD일')} 주식 거래</h4>
          <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
            <thead>
              <tr>
                <th>유형</th>
                <th>내용</th>
                <th>종목</th>
                <th>수량</th>
                <th>단가 / 합계</th>
                <th>거래계좌</th>
                <th>기능</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: AccountProperties[AccountType.BUY].color }}>매수</td>
                <td>자산배분</td>
                <td>SPDR S&P 500 ETF</td>
                <td className="right">100</td>
                <td className="right">
                  {CurrencyProperties[Currency.USD].symbol} 100.50
                  <br />= {CurrencyProperties[Currency.USD].symbol} 100,000.00
                </td>
                <td>복슬증권</td>
                <td style={{ textAlign: 'center' }}>
                  <ButtonGroup size="sm">
                    <Button className="small-text-button" variant="secondary">
                      수정
                    </Button>
                    <Button className="small-text-button" variant="light">
                      삭제
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td style={{ color: AccountProperties[AccountType.SELL].color }}>매도</td>
                <td>자산배분</td>
                <td>복슬전자</td>
                <td className="right">100,000</td>
                <td className="right">
                  {CurrencyProperties[Currency.KRW].symbol} 100
                  <br />= {CurrencyProperties[Currency.KRW].symbol} 10,000,000
                </td>
                <td>복슬증권</td>
                <td style={{ textAlign: 'center' }}>
                  <ButtonGroup size="sm">
                    <Button className="small-text-button" variant="secondary">
                      수정
                    </Button>
                    <Button className="small-text-button" variant="light">
                      삭제
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            </tbody>
          </Table>

          <h4>{moment(selectDate).format('YYYY년 MM월 DD일')} 환전</h4>
          <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
            <thead>
              <tr>
                <th>매도통화</th>
                <th>매도금액</th>
                <th>매수통화</th>
                <th>매수금액</th>
                <th>환율</th>
                <th>거래계좌</th>
                <th>기능</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {CurrencyProperties[Currency.USD].name}({CurrencyProperties[Currency.USD].symbol})
                </td>
                <td className="right">500.58</td>
                <td>
                  {CurrencyProperties[Currency.KRW].name}({CurrencyProperties[Currency.KRW].symbol})
                </td>
                <td className="right">500,000</td>
                <td className="right">998.84</td>
                <td>복슬증권</td>
                <td style={{ textAlign: 'center' }}>
                  <ButtonGroup size="sm">
                    <Button className="small-text-button" variant="secondary">
                      수정
                    </Button>
                    <Button className="small-text-button" variant="light">
                      삭제
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            </tbody>
          </Table>
          <h4>{moment(selectDate).format('YYYY년 MM월')} 결산</h4>
          <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
            <tbody>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.EXPENSE].color }}>지출</span>
                </td>
                <td className="right">10,000</td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.INCOME].color }}>수입</span>
                </td>
                <td className="right">10,000</td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.INCOME].color }}>수입</span> -{' '}
                  <span style={{ color: AccountProperties[AccountType.EXPENSE].color }}>지출</span>
                </td>
                <td className="right">10,000</td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.TRANSFER].color }}>이체</span>
                </td>
                <td className="right">10,000</td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.BUY].color }}>매수</span>
                </td>
                <td className="right">{CurrencyProperties[Currency.KRW].symbol} 10,000</td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.BUY].color }}>매수</span>
                </td>
                <td className="right">{CurrencyProperties[Currency.USD].symbol} 10,000.05</td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.SELL].color }}>매도</span>
                </td>
                <td className="right">{CurrencyProperties[Currency.KRW].symbol} 10,000</td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.EXCHANGE].color }}>환전</span>
                </td>
                <td className="right">{CurrencyProperties[Currency.KRW].symbol} 5,557.25</td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: AccountProperties[AccountType.EXCHANGE].color }}>환전</span>
                </td>
                <td className="right">{CurrencyProperties[Currency.USD].symbol} 10,000</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default LedgerCalendar;
