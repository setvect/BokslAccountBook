/** A calendar day is stored as YYYY-MM-DD, never interpreted as a UTC instant. */
export function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`날짜 형식이 올바르지 않습니다: ${value}`);
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) throw new Error(`존재하지 않는 날짜입니다: ${value}`);
  return date;
}
export function formatDateOnly(value: Date): string {
  if (!Number.isFinite(value.getTime())) throw new Error('유효한 날짜가 필요합니다.');
  return `${String(value.getFullYear()).padStart(4, '0')}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(
    2,
    '0',
  )}`;
}
