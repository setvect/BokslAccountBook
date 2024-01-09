import { Col } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import moment from 'moment';
import { EventApi, EventContentArg } from '@fullcalendar/common';
import _ from 'lodash';
import eventIconMap from './eventIconMap';
import getAnniversary, { Anniversary } from '../util/DateUtil';
import ContextMenu, { ContextMenuHandle } from './ContextMenu';
import TransactionModal, { TransactionModalHandle } from '../common/TransactionModal';
import { AccountType, AccountTypeProperties, CurrencyProperties } from '../../common/RendererModel';
import TradeModal, { TradeModalHandle } from '../common/TradeModal';
import ExchangeModal, { ExchangeModalHandle } from '../common/ExchangeModal';
import MemoModal, { MemoModalHandle } from '../common/MemoModal';
import { Currency, ExchangeKind, TradeKind, TransactionKind } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';
import { ResSearchModel } from '../../../common/ResModel';
import { generateUUID } from '../../../common/CommonUtil';
import { convertToCommaSymbol } from '../util/util';
import StockMapper from '../../mapper/StockMapper';

export interface CalendarPartHandle {
  reloadLedger: () => void;
}

interface CalendarPartProps {
  onChangeDate: (message: Date) => void;
  onChange: () => void;
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

const CalendarPart = forwardRef<CalendarPartHandle, CalendarPartProps>((props, ref) => {
  const [events, setEvents] = useState<Array<any>>([]);
  const [selectDate, setSelectDate] = useState<Date>(new Date());

  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const transactionModalRef = useRef<TransactionModalHandle>(null);
  const tradeModalRef = useRef<TradeModalHandle>(null);
  const exchangeModalRef = useRef<ExchangeModalHandle>(null);
  const memoModalRef = useRef<MemoModalHandle>(null);
  const contextMenuRef = useRef<ContextMenuHandle>(null);

  // 외부에서 호출할 수 있는 함수를 정의
  useImperativeHandle(ref, () => ({
    reloadLedger: async () => {
      await loadEvent(getCurrentMonthStartDate());
    },
  }));
  const getCurrentMonthStartDate = () => {
    if (!calendarRef.current) {
      return new Date();
    }
    const calendarApi = calendarRef.current.getApi();
    const { view } = calendarApi;
    const { currentStart } = view;
    return currentStart;
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event as ExtendedEventApi;
    return (
      <div>
        {event.extendedProps.icon}
        <span style={{ marginLeft: '4px' }} title={event.title}>
          {event.title}
        </span>
      </div>
    );
  };

  const emitSelectDate = (date: Date) => {
    const { current } = calendarRef;
    if (!current) {
      return;
    }
    const calendarApi = current.getApi();
    calendarApi.select(date);
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
    setSelectDate(start);
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
  const handleDatesSet = async () => {
    const currentDate = getCurrentMonthStartDate();
    emitSelectDate(currentDate);
    props.onChangeDate(currentDate);
    await loadEvent(currentDate);

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

  function getSearchModeForCurrentMonth(currentDate: Date, accountTypes: AccountType[]) {
    const startDate = moment(currentDate).startOf('month').toDate();
    const endDate = moment(currentDate).endOf('month').toDate();
    const searchMode: ResSearchModel = {
      from: startDate,
      to: endDate,
      checkType: new Set(accountTypes),
    };
    return searchMode;
  }

  function generateEvents(groupedResult: { date: Date; amount: number; kind: AccountType; currency: Currency }[]) {
    return groupedResult.map((group) => {
      const icon = eventIconMap[group.kind];
      const title = convertToCommaSymbol(group.amount, group.currency);
      return {
        id: generateUUID(),
        title,
        start: group.date,
        icon,
        order: AccountTypeProperties[group.kind].order,
      };
    });
  }
  async function getTransactionEventList(currentDate: Date) {
    const searchMode = getSearchModeForCurrentMonth(currentDate, [AccountType.SPENDING, AccountType.INCOME, AccountType.TRANSFER]);
    const transactionList = await IpcCaller.getTransactionList(searchMode);
    const groupedResult = _(transactionList)
      .groupBy((t) => `${moment(t.transactionDate).format('YYYY-MM-DD')}_${t.kind}_${t.currency}`)
      .map((group, key) => ({
        date: group[0].transactionDate,
        kind: group[0].kind.toString() as AccountType,
        currency: group[0].currency,
        amount: _.sumBy(group, 'amount'),
      }))
      .map((item) => ({
        ...item,
        kindOrder: AccountTypeProperties[item.kind].order,
        currencyOrder: CurrencyProperties[item.currency].order,
      }))
      .sortBy(['date', 'kindOrder', 'currencyOrder'])
      .value();
    return generateEvents(groupedResult);
  }

  async function getTradeEventList(currentDate: Date) {
    const searchMode = getSearchModeForCurrentMonth(currentDate, [AccountType.BUY, AccountType.SELL]);
    const tradeList = await IpcCaller.getTradeList(searchMode);

    const groupedResult = _(tradeList)
      .groupBy((t) => {
        const { currency } = StockMapper.getStock(t.stockSeq);
        return `${moment(t.tradeDate).format('YYYY-MM-DD')}_${t.kind}_${currency}`;
      })
      .map((group, key) => {
        const { currency } = StockMapper.getStock(group[0].stockSeq);
        return {
          date: group[0].tradeDate,
          kind: group[0].kind.toString() as AccountType,
          currency,
          amount: _.sumBy(group, (trade) => trade.price * trade.quantity),
        };
      })
      .map((item) => ({
        ...item,
        kindOrder: AccountTypeProperties[item.kind].order,
        currencyOrder: CurrencyProperties[item.currency].order,
      }))
      .sortBy(['date', 'kindOrder', 'currencyOrder'])
      .value();
    return generateEvents(groupedResult);
  }

  async function getExchangeEventList(currentDate: Date) {
    const searchMode = getSearchModeForCurrentMonth(currentDate, [AccountType.EXCHANGE_BUY, AccountType.EXCHANGE_SELL]);
    const exchangeList = await IpcCaller.getExchangeList(searchMode);
    const groupedResult = _(exchangeList)
      .groupBy((t) => `${moment(t.exchangeDate).format('YYYY-MM-DD')}_${t.kind}`)
      .map((group, key) => ({
        date: group[0].exchangeDate,
        kind: group[0].kind.toString() as AccountType,
        currency: Currency.KRW,
        amount: _.sumBy(group, (exchange) => {
          if (exchange.kind === ExchangeKind.EXCHANGE_BUY) {
            return exchange.buyAmount;
          }
          return exchange.sellAmount;
        }),
      }))
      .map((item) => ({
        ...item,
        kindOrder: AccountTypeProperties[item.kind].order,
      }))
      .sortBy(['date', 'kindOrder'])
      .value();
    return generateEvents(groupedResult);
  }

  async function getMemoEventList(currentDate: Date) {
    const searchMode = getSearchModeForCurrentMonth(currentDate, [AccountType.MEMO]);
    const list = await IpcCaller.getMemoList(searchMode);
    return list.map((memo) => {
      return {
        id: generateUUID(),
        title: memo.note,
        start: memo.memoDate,
        icon: eventIconMap[AccountType.MEMO],
      };
    });
  }

  const updateEvents = (newEvents: any[]) => {
    // 새로운 이벤트 추가
    newEvents.forEach((newEvent) => {
      if (!events.some((event) => event.id === newEvent.id)) {
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }
    });

    // 기존 이벤트 삭제
    events.forEach((event) => {
      if (!newEvents.some((newEvent) => newEvent.id === event.id)) {
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));
      }
    });
  };

  const loadEvent = async (currentDate: Date) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) {
      return;
    }
    const transactionEventList = await getTransactionEventList(currentDate);
    const tradeEventList = await getTradeEventList(currentDate);
    const exchangeEventList = await getExchangeEventList(currentDate);
    const memoEventList = await getMemoEventList(currentDate);
    const newEvents = [...transactionEventList, ...tradeEventList, ...exchangeEventList, ...memoEventList];
    updateEvents(newEvents);
  };

  const handleMenuItemClick = (action: AccountType) => {
    if (action === AccountType.SPENDING) {
      transactionModalRef.current?.openTransactionModal(TransactionKind.SPENDING, 0, selectDate);
    } else if (action === AccountType.INCOME) {
      transactionModalRef.current?.openTransactionModal(TransactionKind.INCOME, 0, selectDate);
    } else if (action === AccountType.TRANSFER) {
      transactionModalRef.current?.openTransactionModal(TransactionKind.TRANSFER, 0, selectDate);
    } else if (action === AccountType.BUY) {
      tradeModalRef.current?.openTradeModal(TradeKind.BUY, 0, selectDate);
    } else if (action === AccountType.SELL) {
      tradeModalRef.current?.openTradeModal(TradeKind.SELL, 0, selectDate);
    } else if (action === AccountType.EXCHANGE_BUY) {
      exchangeModalRef.current?.openExchangeModal(ExchangeKind.EXCHANGE_BUY, 0, selectDate);
    } else if (action === AccountType.EXCHANGE_SELL) {
      exchangeModalRef.current?.openExchangeModal(ExchangeKind.EXCHANGE_SELL, 0, selectDate);
    } else if (action === AccountType.MEMO) {
      memoModalRef.current?.openMemoModal(selectDate);
    }
  };

  // 컴포넌트가 처음 마운트 되었을 때 한번만 실행
  useEffect(() => {
    (async () => {
      await loadEvent(getCurrentMonthStartDate());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadCalendar = async () => {
    props.onChange();
    await loadEvent(getCurrentMonthStartDate());
  };

  return (
    <Col
      ref={calendarContainerRef}
      onContextMenu={(e) => {
        if (typeof document.hasFocus === 'function' && !document.hasFocus()) return;

        e.preventDefault();
        contextMenuRef.current?.open(e.clientX, e.clientY);
      }}
    >
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
        // 이벤트 입력 순서로 표시
        eventOrder={[]}
        headerToolbar={{
          left: '',
          center: 'title',
          right: 'prevYear,prev,next,nextYear today',
        }}
        height="auto"
      />
      <ContextMenu onMenuItemClick={handleMenuItemClick} ref={contextMenuRef} />
      <TransactionModal ref={transactionModalRef} onSubmit={() => reloadCalendar()} />
      <TradeModal ref={tradeModalRef} onSubmit={() => reloadCalendar()} />
      <ExchangeModal ref={exchangeModalRef} onSubmit={() => reloadCalendar()} />
      <MemoModal ref={memoModalRef} onSubmit={() => reloadCalendar()} />
    </Col>
  );
});

export default CalendarPart;
