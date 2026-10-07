import { formatDateOnly, parseDateOnly } from '../../common/dateOnly';

/** Date-typed entities/IPC values stay Date objects while SQLite keeps the existing DATE text. */
const dateOnlyTransformer = {
  to(value: Date | string | null | undefined): string | null | undefined {
    if (value == null) return value;
    if (typeof value === 'string') {
      parseDateOnly(value);
      return value;
    }
    return formatDateOnly(value);
  },
  from(value: string | null | undefined): Date | undefined {
    return value == null ? undefined : parseDateOnly(value);
  },
};
export default dateOnlyTransformer;
