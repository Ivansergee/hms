export function getDaysInMonth(year: number, month: number): number[] {
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
}

export function range(from: number, to: number): number[] {
  if (to < from) {
    return [];
  }
  const size = to - from;
  return [...Array(size + 1).keys()].map(i => i + from);
}
