export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const AVERAGE_MONTH_MS = 30.436875 * DAY_MS;

export type TimeLeft = {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

export function shouldContinueCountdown(timeLeft: TimeLeft): boolean {
  return !timeLeft.isPast;
}

export function getTimeLeft(targetMs: number, nowMs = Date.now()): TimeLeft {
  const isPast = nowMs >= targetMs;
  const diff = Math.max(0, targetMs - nowMs);
  const months = Math.floor(diff / AVERAGE_MONTH_MS);
  const afterMonths = diff - months * AVERAGE_MONTH_MS;
  const days = Math.floor(afterMonths / DAY_MS);
  const afterDays = afterMonths - days * DAY_MS;
  const hours = Math.floor(afterDays / HOUR_MS);
  const afterHours = afterDays - hours * HOUR_MS;
  const minutes = Math.floor(afterHours / MINUTE_MS);

  return {
    months,
    days,
    hours,
    minutes,
    seconds: Math.floor((afterHours - minutes * MINUTE_MS) / 1000),
    isPast,
  };
}
