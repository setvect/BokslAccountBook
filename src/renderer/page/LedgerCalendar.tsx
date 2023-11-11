import { Col, Container, Row } from 'react-bootstrap';
import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import koLocale from '@fullcalendar/core/locales/ko';
import moment from 'moment';
import getAnniversary, { Anniversary } from '../utils/DateUtil';

function LedgerCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const anniversaries: Anniversary[] = [];

  const getCurrentDate = () => {
    if (!calendarRef.current) {
      return new Date();
    }
    const calendarApi = calendarRef.current.getApi();
    const { view } = calendarApi;
    const { currentStart } = view;
    return currentStart;
  };

  const renderDayCellContent = (dateValue: any) => {
    const date = dateValue.date as Date;
    const dateStr = moment(date).format('YYYY-MM-DD');

    const anniversary = anniversaries.find((a) => a.date === dateStr);
    const isHoliday = anniversary?.event.holiday;

    return (
      <>
        <span className="anniversary-name">{anniversary?.event.name}</span>
        <span className={`day-number ${isHoliday ? 'holiday' : ''}`}>{date.getDate()}</span>
      </>
    );
  };

  const handleDatesSet = () => {
    const currentDate = getCurrentDate();
    anniversaries.length = 0;
    const anniversary = getAnniversary(currentDate.getFullYear());
    anniversaries.push(...anniversary);
  };

  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>달력</h2>
      {/* eslint-disable-next-line react/button-has-type */}
      <button onClick={getCurrentDate}>현재 날짜 정보 가져오기</button>
      <Row>
        <Col>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale={koLocale}
            dayCellContent={renderDayCellContent}
            datesSet={handleDatesSet}
            headerToolbar={{
              left: '',
              center: 'title',
              right: 'prevYear,prev,next,nextYear today',
            }}
            events={[
              { title: 'event 1', date: '2023-11-01' },
              { title: 'event 2', date: '2023-11-02' },
            ]}
          />
        </Col>
        <Col>2 of 2</Col>
      </Row>
    </Container>
  );
}

export default LedgerCalendar;
