import moment from 'moment';

require('moment-lunar');

export interface Anniversary {
  date: string;
  event: {
    name: string;
    holiday: boolean;
  };
}

/**
 * 기념일 계산
 * @param year
 */
const getAnniversary = (year: number): Anniversary[] => {
  const result: Anniversary[] = [];
  result.push({
    date: `${year}-01-01`,
    event: { name: '신정', holiday: true },
  });
  result.push({
    date: `${year}-02-05`,
    event: { name: '복슬이 생일', holiday: false },
  });
  result.push({
    date: `${year}-03-01`,
    event: { name: '삼일절', holiday: true },
  });
  result.push({
    date: `${year}-04-05`,
    event: { name: '식목일', holiday: false },
  });
  result.push({
    date: `${year}-04-19`,
    event: { name: '4·19혁명 기념일', holiday: false },
  });
  result.push({
    date: `${year}-05-01`,
    event: { name: '노동절', holiday: false },
  });
  result.push({
    date: `${year}-05-05`,
    event: { name: '어린일날', holiday: true },
  });
  result.push({
    date: `${year}-05-08`,
    event: { name: '어버이날', holiday: false },
  });
  result.push({
    date: `${year}-05-15`,
    event: { name: '스승의날', holiday: false },
  });
  result.push({
    date: `${year}-06-06`,
    event: { name: '현충일', holiday: true },
  });
  result.push({
    date: `${year}-08-15`,
    event: { name: '광복절', holiday: true },
  });
  result.push({
    date: `${year}-10-01`,
    event: { name: '국군의 날', holiday: false },
  });
  result.push({
    date: `${year}-10-03`,
    event: { name: '개천절', holiday: true },
  });
  result.push({
    date: `${year}-10-09`,
    event: { name: '한글날', holiday: true },
  });
  result.push({
    date: `${year}-12-25`,
    event: { name: '성탄절', holiday: true },
  });

  const lunarDays = [
    { yearDiff: -1, month: 12, date: 30, holiday: true, name: '설날(연휴)' },
    { yearDiff: 0, month: 1, date: 1, holiday: true, name: '설날' },
    { yearDiff: 0, month: 1, date: 2, holiday: true, name: '설날(연휴)' },
    { yearDiff: 0, month: 4, date: 8, holiday: true, name: '석가탄신일' },
    { yearDiff: 0, month: 8, date: 14, holiday: true, name: '추석(연휴)' },
    { yearDiff: 0, month: 8, date: 14, holiday: false, name: '반달이 생일' },
    { yearDiff: 0, month: 8, date: 15, holiday: true, name: '추석' },
    { yearDiff: 0, month: 8, date: 16, holiday: true, name: '추석(연휴)' },
  ];

  lunarDays.forEach((value) => {
    try {
      const lunarDate = moment()
        .year(year + value.yearDiff)
        .month(value.month - 1)
        .date(value.date)
        // @ts-ignore
        .solar()
        .format('YYYY-MM-DD');

      result.push({
        date: lunarDate,
        event: { name: value.name, holiday: value.holiday },
      });
    } catch (error) {
      console.error('음력 날짜 변환 중 오류 발생:', error);
    }
  });

  return result;
};

export default getAnniversary;
