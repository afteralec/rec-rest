import { isZoneValid } from "./zone";
import type { Zone } from "./zone";

export type DateInput = {
  hour: number;
  day: number;
  month: number;
  year: number;
  zone: string;
};

export type SearchInput = {
  diners: string[];
  dates: DateInput[];
  zone: Zone;
};

export type ReserveInput = {
  diners: string[];
  date: DateInput;
};

// TODO: Let this function return a legible reason the input isn't valid
function isDateInputValid(input: any): input is DateInput {
  if (!("hour" in input)) return false;
  if (typeof input.hour != "number") return false;

  if (!("day" in input)) return false;
  if (typeof input.day != "number") return false;

  if (!("month" in input)) return false;
  if (typeof input.month != "number") return false;

  if (!("year" in input)) return false;
  if (typeof input.year != "number") return false;

  return true;
}

function isDinersArrayValid(diners: any): diners is string[] {
  if (!Array.isArray(diners)) return false;
  if (diners.length === 0) return false;
  if (typeof diners[0] != "string") return false;

  return true;
}

function isDateInputArrayValid(dates: any): dates is DateInput[] {
  if (!Array.isArray(dates)) return false;
  if (dates.length === 0) return false;
  if (!isDateInputValid(dates[0])) return false;

  return true;
}

// TODO: Let this function return a legible reason the input isn't valid
export function isSearchInputValid(input: any): input is SearchInput {
  if (!("diners" in input)) return false;
  if (!isDinersArrayValid(input.diners)) return false;

  if (!("dates" in input)) return false;
  if (!isDateInputArrayValid(input.dates)) return false;

  if (!("zone" in input)) return false;
  if (!isZoneValid(input.zone)) return false;

  return true;
}

export function isReserveInputValid(input: any): input is ReserveInput {
  if (!("diners" in input)) return false;
  if (!isDinersArrayValid(input.diners)) return false;

  if (!("date" in input)) return false;
  if (!isDateInputValid(input.date)) return false;

  return true;
}
