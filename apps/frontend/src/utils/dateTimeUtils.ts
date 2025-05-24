import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(minMax);

export function getDaysRange(from: string, to: string): string[] {
  const fromObj = dayjs(from);
  const toObj = dayjs(to);

  const dates = [];

  let date = fromObj.startOf('day');
  while (date.isBefore(toObj.add(1, 'day'), 'day')) {
    dates.push(date.format('YYYY-MM-DD'));
    date = date.add(1, 'day');
  }

  return dates;
}

export function getMonthDates(initDate: dayjs.Dayjs): string[] {
  const endDate = initDate.startOf('month').add(1, 'month');
  const dates = [];

  let date = initDate.startOf('month');
  while (date.isBefore(endDate, 'day')) {
    dates.push(date.format('YYYY-MM-DD'));
    date = date.add(1, 'day');
  }

  return dates;
}

export function getDayFromDate(date: string): string {
  return dayjs(date).format('D');
}

export function getTimeFromDate(date: string): string {
  return dayjs(date).format('HH:mm');
}

export function setTimeOnDate(date: string, time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  return dayjs(date).hour(hour).minute(minute).format('YYYY-MM-DD HH:mm');
}

export function getWeekdayFromDate(date: string): string {
  return dayjs(date).format('ddd');
}

export function getDifferenceInDays(date1: string, date2: string): number {
  return dayjs(date2).startOf('day').diff(dayjs(date1).startOf('day'), 'd');
}

export function getDifferenceInMinutes(date1: string | Dayjs, date2: string): number {
  return dayjs(date2).diff(dayjs(date1), 'minutes');
}

export function getMinutesFromDayStart(date: string): number {
  return getDifferenceInMinutes(dayjs(date).startOf('day'), date);
}

export function getMinDateByDay(date1: dayjs.Dayjs | string, date2: dayjs.Dayjs | string): string {
  return dayjs.min(dayjs(date1), dayjs(date2)).format('YYYY-MM-DD HH:mm');
}

export function getMaxDateByDay(date1: dayjs.Dayjs | string, date2: dayjs.Dayjs | string): string {
  return dayjs.max(dayjs(date1), dayjs(date2)).format('YYYY-MM-DD HH:mm');
}

export function addDays(date: string, daysAmount: number): string {
  return dayjs(date).add(daysAmount, 'd').format('YYYY-MM-DD HH:mm');
}

export function subtractDays(date: string, daysAmount: number): string {
  return dayjs(date).subtract(daysAmount, 'd').format('YYYY-MM-DD HH:mm');
}

export function isSameDay(date1: string, date2: string): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'd');
}

export function toISOString(date: string): string {
  return dayjs( date, "YYYY-MM-DD HH:mm").toISOString();
}

export function fromISOString(date: string): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function getFormattedDate(date: string, withTime: boolean = false): string {
  if (withTime) {
    return dayjs(date).format('DD.MM.YYYY HH:mm');
  } else {
    return dayjs(date).format('DD.MM.YYYY');
  }
}
