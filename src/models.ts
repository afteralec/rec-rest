import { DateTime } from "luxon";

type Restaurant = {
  id: number;
  name: string;
  endorsements: Endorsement[];
  reservationTimeZone: string;
  reservationWindows: ReservationWindow[];
  tables: Table[];
};

type ReservationWindow = {
  start: DateTime;
  end: DateTime;
};

export function newRestaurant(): Restaurant {
  const zone = "America/Los_Angeles";

  return {
    id: 1,
    name: "Test",
    endorsements: [],
    reservationTimeZone: zone,
    reservationWindows: generateReservationWindows({
      zone,
      daysForwardStart: 1,
      daysForwardEnd: 30,
    }),
    tables: [newTable()],
  };
}

export function newTable(): Table {
  return {
    id: 1,
    capacity: 2,
    minimum: 1,
    reservations: [],
  };
}

type GenerateReservationWindowsParameters = {
  zone: string;
  daysForwardStart: number;
  daysForwardEnd: number;
};

export function generateReservationWindows({
  zone,
  daysForwardStart,
  daysForwardEnd,
}: GenerateReservationWindowsParameters): ReservationWindow[] {
  const windows = [];

  for (let days = daysForwardStart; days <= daysForwardEnd; days++) {
    const date = DateTime.fromObject({ hour: 0 }, { zone }).plus({
      days,
    });

    const start = DateTime.fromObject(
      {
        day: date.day,
        month: date.month,
        year: date.year,
        hour: 16,
      },
      { zone },
    );

    const end = DateTime.fromObject(
      {
        day: date.day,
        month: date.month,
        year: date.year,
        hour: 21,
      },
      { zone },
    );

    windows.push({ start, end });
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
): number[] {
  if (restaurant.reservationWindows.length === 0) return [];
  if (!restaurantAcceptsReservationsStarting(restaurant, params.start)) {
    return [];
  }

  const results = [];
  for (const table of restaurant.tables) {
    if (table.capacity < params.capacity) continue;
    if (table.minimum > params.capacity) continue;
    if (tableReservedAt(table, params.start)) continue;

    results.push(table.id);
  }
  return results;
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

export type Endorsement = {
  id: number;
  tag: string;
};

export type Table = {
  id: number;
  minimum: number;
  capacity: number;
  reservations: Reservation[];
};

export type Reservation = {
  id: number;
  dinerIDs: number[];
  start: DateTime;
  end: DateTime;
};
