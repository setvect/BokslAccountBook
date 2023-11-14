import { Button, Col } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import moment from 'moment';
import { EventApi, EventContentArg } from '@fullcalendar/common';
import eventIconMap from './eventIconMap';
import getAnniversary, { Anniversary } from '../../utils/DateUtil';
import ContextMenu, { ContextMenuItem } from './ContextMenu';

export interface CalendarPartMethods {
  reloadLedger: () => void;
}

interface CalendarPartProps {
  onChangeDate: (message: Date) => void;
}

// 이벤트 객체에 icon 속성을 추가하기 위한 인터페이스 확장
interface ExtendedEventApi extends EventApi {
  extendedProps: {
    icon?: React.ReactNode;
    backgroundColor?: React.ReactNode;
  };
}

// TODO CalendarPart 함수안에 있으면 안되는데 여기어 있으면 정상 동작. 원인 파악
const anniversaries: Anniversary[] = [];

const CalendarPart = forwardRef<CalendarPartMethods, CalendarPartProps>((props, ref) => {
  const [events, setEvents] = useState<Array<any>>([]);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const calendarRef = useRef<FullCalendar>(null);

  // 외부에서 호출할 수 있는 함수를 정의
  useImperativeHandle(ref, () => ({
    reloadLedger: () => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        console.log('원장 다시 계산');
      }
    },
  }));

  const addRandomEvent = () => {
    const randomDay = Math.floor(Math.random() * 28) + 1; // 1일부터 28일 사이의 랜덤한 날짜

    const keys = Object.keys(eventIconMap);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const icon = eventIconMap[randomKey];

    const newEvent = {
      id: Date.now().toString(), // 유니크한 ID 생성
      title: 'Random Event',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), randomDay),
      icon,
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

      props.onChangeDate(start);
    }
  };

  /**
   * 년도 또는 월 이동 시 이벤트
   */
  const handleDatesSet = () => {
    const currentDate = getCurrentMonthStartDate();
    emitSelectDate(currentDate);
    removeAllEvents();

    const anniversary = getAnniversary(currentDate.getFullYear());
    anniversaries.length = 0;
    anniversaries.push(...anniversary);
  };

  /**
   * 이벤트 항목 클릭 시 달력 셀(날짜) 클릭 효과 부여
   */
  const handleEventClick = (eventClickArg: any) => {
    const date = eventClickArg.event.start;
    emitSelectDate(date);
  };

  async function loadEvent(currentDate: Date) {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      console.log('이벤트 로드 로직 추가');
      addRandomEvent();
    }
  }

  useEffect(() => {
    loadEvent(getCurrentMonthStartDate());
    emitSelectDate(new Date());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: '이벤트 추가', onClick: () => console.log('이벤트 추가') },
        { label: '이벤트 제거', onClick: () => console.log('이벤트 제거') },
        // 기타 메뉴 항목...
      ],
    });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <Col ref={calendarContainerRef} onContextMenu={handleRightClick}>
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
        height="auto"
      />
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenu.items} />}
    </Col>
  );
});

export default CalendarPart;
