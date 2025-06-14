import dayjs from "dayjs";

export function formatDate(date: Date, withTime: boolean = true): string {
    return withTime
        ? dayjs(date).format('YYYY-MM-DD HH:mm')
        : dayjs(date).format('YYYY-MM-DD');
}
