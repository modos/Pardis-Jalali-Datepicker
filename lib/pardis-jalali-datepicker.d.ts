export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface DateRange {
  start: JalaliDate | null;
  end: JalaliDate | null;
}

export interface PardisOptions {
  inline?: boolean;
  rangeMode?: boolean;
  outputFormat?: 'jalali' | 'gregorian' | 'both';
  mobileMode?: boolean;
  minDate?: JalaliDate | null;
  maxDate?: JalaliDate | null;
  initialYear?: number | null;
  initialMonth?: number | null;
  disabledDates?: JalaliDate[] | ((jy: number, jm: number, jd: number) => boolean) | null;
  highlightedDates?: (JalaliDate & { className?: string })[] | null;
  maxRange?: number | null;
  numeralType?: 'persian' | 'latin';
  onChange?: ((payload: object) => void) | null;
  onRangeStart?: ((payload: object) => void) | null;
  onRangeSelect?: ((range: DateRange) => void) | null;
  onClear?: (() => void) | null;
}

export declare const JalaaliUtil: {
  isLeapJalaaliYear(jy: number): boolean;
  jalaaliMonthLength(jy: number, jm: number): number;
  toJalaali(gy: number, gm: number, gd: number): JalaliDate;
  toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number };
  todayJalaali(): JalaliDate;
  j2d(jy: number, jm: number, jd: number): number;
  d2j(jdn: number): JalaliDate;
};

export declare class PardisEngine {
  static MIN_YEAR: number;
  static MAX_YEAR: number;
  static buildDatePayload(jy: number, jm: number, jd: number, format?: 'jalali' | 'gregorian' | 'both'): object;
  static formatNum(n: number, numeralType: 'persian' | 'latin'): string;
}

export declare class PardisDatepicker {
  constructor(target: string | HTMLElement, options?: PardisOptions);
  getValue(): object | null;
  setValue(jy: number, jm: number, jd: number): void;
  clear(): void;
  setOption(key: keyof PardisOptions, value: unknown): void;
  open(): void;
  close(): void;
  destroy(): void;
  goToToday(): void;
  getPresetRange(name: 'thisWeek' | 'thisMonth' | 'last7Days' | 'last30Days'): DateRange;
}
