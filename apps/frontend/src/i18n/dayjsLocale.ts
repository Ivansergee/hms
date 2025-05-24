import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import ruLocale from 'dayjs/locale/ru';

const customRu = {
  ...ruLocale,
  monthsShort: [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ],
  weekdays: [
    'Воскресенье', 'Понедельник', 'Вторник',
    'Среда', 'Четверг', 'Пятница', 'Суббота'
  ],
  weekdaysShort: [
    'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'
  ],
};

export const setupDayjsLocale = () => {
  dayjs.locale(customRu, undefined, true);
  dayjs.locale('ru');
};
