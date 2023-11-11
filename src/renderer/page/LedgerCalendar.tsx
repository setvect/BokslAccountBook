import { Col, Container, Row } from 'react-bootstrap';
import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import moment from 'moment';
import getAnniversary, { Anniversary } from '../utils/DateUtil';

function LedgerCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const anniversaries: Anniversary[] = [];
  let selectDate: Date;

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

    const anniversariesForDay = anniversaries.filter((a) => a.date === dateStr);
    const anniversaryNames = anniversariesForDay.map((a) => a.event.name).join(', ');
    const isHoliday = anniversariesForDay.some((a) => a.event.holiday);

    return (
      <>
        <span className="anniversary-name">{anniversaryNames}</span>
        <span className={`day-number ${isHoliday ? 'holiday' : ''}`}>{date.getDate()}</span>
      </>
    );
  };

  /**
   * 날짜를 선택
   */
  const handleDateSelect = (selectInfo: any) => {
    const { start } = selectInfo;
    selectDate = start;
    const calendarEl = calendarContainerRef.current;

    // 날짜를 선택하고 포커스를 잃었을 때 배경색이 되돌아 오는것을 방지
    // 직접 DOM 조작했음
    if (calendarEl) {
      calendarEl.querySelectorAll('.fc-day').forEach((day) => {
        day.classList.remove('cal-select');
      });

      const selectedDay = calendarEl.querySelector(`.fc-day[data-date='${moment(start).format('YYYY-MM-DD')}']`);
      if (selectedDay) {
        selectedDay.classList.add('cal-select');
      }
    }
  };

  const handleDatesSet = () => {
    const currentDate = getCurrentDate();
    anniversaries.length = 0;
    const anniversary = getAnniversary(currentDate.getFullYear());
    anniversaries.push(...anniversary);
  };

  // 이벤트 항목 클릭 시 달력 셀(날짜) 클릭 효과 부여
  const handleEventClick = (eventClickArg: any) => {
    const { current } = calendarRef;
    if (!current) {
      return;
    }
    const calendarApi = current.getApi();
    calendarApi.select(eventClickArg.event.start);
  };

  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>달력</h2>
      <Row>
        <Col ref={calendarContainerRef}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={koLocale}
            selectable
            selectConstraint={{
              start: '00:00',
              end: '24:00',
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            }}
            showNonCurrentDates={false}
            dayCellContent={renderDayCellContent}
            datesSet={handleDatesSet}
            select={handleDateSelect}
            eventClick={handleEventClick}
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
