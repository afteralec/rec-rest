import { DateTime } from "luxon";

import type { Endorsement } from "../endorsements";
import type { Reservation } from "../reservations";
import type { DateInput } from "../input";

export { loadRestaurantsForSearch } from "./load";

export type Restaurant = {
  id: number;
  name: string;
  zone: string;
  endorsements: Endorsement[];
  tables: Table[];
  reservationWindows: ReservationWindow[];
};

export type Table = {
  id: number;
  minimum: number;
  capacity: number;
  reservations: Reservation[];
};

export type ReservationWindow = {
  start: DateTime;
  end: DateTime;
};

export type ReservationWindowTemplate = {
  startHour: number;
  endHour: number;
};

export type RestaurantConfig = {
  zone: string;
};

type GenerateReservationWindowsParameters = {
  zone: string;
  dates: DateInput[];
  windowTemplates: ReservationWindowTemplate[];
};

export function generateReservationWindows({
  zone,
  dates,
  windowTemplates,
}: GenerateReservationWindowsParameters): ReservationWindow[] {
  const windows = [];

  for (const { month, day, year } of dates) {
    for (const { startHour, endHour } of windowTemplates) {
      const start = DateTime.fromObject(
        { month, day, year, hour: startHour },
        { zone },
      );
      const end = DateTime.fromObject(
        { month, day, year, hour: endHour },
        { zone },
      );

      windows.push({ start, end });
    }
  }

  return windows;
}

type AvailableTimesParameters = {
  capacity: number;
  start: DateTime;
  end: DateTime;
};

export function availableTables(
  restaurant: Restaurant,
  params: AvailableTimesParameters,
): Table[] {
  if (restaurant.reservationWindows.length === 0) return [];
  if (!restaurantAcceptsReservationsStarting(restaurant, params.start)) {
    return [];
  }

  return restaurant.tables.filter((table) => {
    if (table.capacity < params.capacity) return false;
    if (table.minimum > params.capacity) return false;
    if (tableReservedAt(table, params.start)) return false;

    return true;
  });
}

export function restaurantAcceptsReservationsStarting(
  restaurant: Restaurant,
  start: DateTime,
): boolean {
  if (restaurant.reservationWindows.length === 0) return false;

  for (const reservationWindow of restaurant.reservationWindows) {
    if (start < reservationWindow.start || start > reservationWindow.end)
      return false;
  }

  return true;
}

// TODO: Let the restaurant configure a "lag time" for reservations for cleanup
export function tableReservedAt(table: Table, time: DateTime): boolean {
  if (table.reservations.length === 0) return false;

  for (const reservation of table.reservations) {
    if (time >= reservation.start && time < reservation.end) {
      return false;
    }
  }

  return true;
}
