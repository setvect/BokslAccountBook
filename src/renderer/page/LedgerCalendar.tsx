import { Button, Col, Container, Row } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import moment from 'moment';
import { EventContentArg, EventApi } from '@fullcalendar/common';
import { FaBirthdayCake, FaPlaneDeparture } from 'react-icons/fa';
import getAnniversary, { Anniversary } from '../utils/DateUtil';

// 이벤트 객체에 icon 속성을 추가하기 위한 인터페이스 확장
interface ExtendedEventApi extends EventApi {
  extendedProps: {
    icon?: React.ReactNode;
  };
}
function LedgerCalendar(): React.ReactElement {
  const [events, setEvents] = useState<Array<any>>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const anniversaries: Anniversary[] = [];
  // 현재 날짜 선택 날짜.
  let selectDate: Date;

  const addRandomEvent = () => {
    const randomDay = Math.floor(Math.random() * 28) + 1; // 1일부터 28일 사이의 랜덤한 날짜
    const newEvent = {
      id: Date.now().toString(), // 유니크한 ID 생성
      title: 'Random Event',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), randomDay),
      icon: <FaBirthdayCake />,
    };
    setEvents([...events, newEvent]);
  };

  const removeAllEvents = () => {
    setEvents([]);
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event as ExtendedEventApi;
    return (
      <div>
        {event.extendedProps.icon}
        <span style={{ marginLeft: '4px' }}>{event.title}</span>
      </div>
    );
  };

  // 날짜 범위에 따라 이벤트를 가져오는 함수
  async function fetchEventsForNewRange(start: Date, end: Date): Promise<Array<{ title: string; start: string }>> {
    const eventList = [];
    for (let i = 0; i < 5; i += 1) {
      const date = moment(start.valueOf() + Math.random() * (end.valueOf() - start.valueOf()));
      eventList.push({
        title: `Event ${i + 1}`,
        start: date.format('YYYY-MM-DD'),
      });
    }
    return eventList;
  }

  async function loadEvent(currentDate: Date) {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      // 현재 캘린더의 모든 이벤트 제거
      calendarApi.getEvents().forEach((event) => event.remove());

      // 새로운 날짜 범위에 해당하는 이벤트 로드
      const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const newEvents = await fetchEventsForNewRange(currentDate, lastDate);
      newEvents.forEach((eventData) => {
        calendarApi.addEvent(eventData);
      });
    }
  }

  function emitSelectDate(date: Date) {
    const { current } = calendarRef;
    if (!current) {
      return;
    }
    const calendarApi = current.getApi();
    calendarApi.select(date);
  }

  const getCurrentMonthStartDate = () => {
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

  /**
   * 년도 또는 월 이동 시 이벤트
   */
  const handleDatesSet = async () => {
    const currentDate = getCurrentMonthStartDate();
    anniversaries.length = 0;
    const anniversary = getAnniversary(currentDate.getFullYear());
    anniversaries.push(...anniversary);
    emitSelectDate(currentDate);
    // await loadEvent(currentDate);
  };

  /**
   * 이벤트 항목 클릭 시 달력 셀(날짜) 클릭 효과 부여
   */
  const handleEventClick = (eventClickArg: any) => {
    const date = eventClickArg.event.start;
    emitSelectDate(date);
  };

  const clearEvent = () => {
    events.length = 0;
  };

  // useEffect(() => {
  //   loadEvent(getCurrentMonthStartDate());
  //   emitSelectDate(new Date());
  // }, [loadEvent]);

  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>달력</h2>
      <Row>
        <Col ref={calendarContainerRef}>
          <Button onClick={addRandomEvent}>이벤트 추가</Button>
          <Button onClick={removeAllEvents}>이벤트 전체 제거</Button>

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
            eventContent={renderEventContent}
            events={events}
            headerToolbar={{
              left: '',
              center: 'title',
              right: 'prevYear,prev,next,nextYear today',
            }}
          />
        </Col>
        <Col>2 of 2</Col>
      </Row>
    </Container>
  );
}

export default LedgerCalendar;
