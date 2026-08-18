export function parseIsoDate(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function parseFutureDate(value: string): Date | null {
  const date = parseIsoDate(value);
  if (!date) return null;

  if (date.getTime() < getStartOfTomorrow().getTime()) {
    return null;
  }

  return date;
}

function getStartOfTomorrow() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}
