import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

export function getDaysRange(from: string, to: string): string[] {
  const fromObj = dayjs(from);
  const toObj = dayjs(to);

  const dates = [];

  let date = fromObj.startOf('day');
  while (date.isBefore(toObj.add(1, 'day'), 'day')) {
    dates.push(date.format('YYYY-MM-DD HH:mm'));
    date = date.add(1, 'day');
  }

  return dates;
}

export function getAdjacentMonthDates(): string[] {
  const currentDate = dayjs();

  const startDate = currentDate.subtract(1, 'month').date(currentDate.date());
  const endDate = currentDate.add(1, 'month').date(currentDate.date());

  const dates = [];

  let date = startDate.startOf('day');
  while (date.isBefore(endDate.add(1, 'day'), 'day')) {
    dates.push(date.format('YYYY-MM-DD HH:mm'));
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
  return dayjs(date1).startOf('day').diff(dayjs(date2).startOf('day'), 'd');
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

export function timeToPercentOfDay(time: string): number {
  const MINUTES_IN_DAY = 1440;
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const percent = totalMinutes / MINUTES_IN_DAY;
  return Number(percent.toFixed(2));
}
