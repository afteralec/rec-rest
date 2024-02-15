import { DateTime } from "luxon";
import type { Knex } from "knex";

import type { DateInput } from ".";

const DEFAULT_TIME_ZONE = "America/Los_Angeles";

export type Restaurant = {
  id: number;
  name: string;
  zone: string;
  endorsements: Endorsement[];
  tables: Table[];
  reservationWindows: ReservationWindow[];
};

type ReservationWindow = {
  start: DateTime;
  end: DateTime;
};

type DateParameters = {
  month: number;
  day: number;
  year: number;
};

type LoadRestaurantsForSearchParameters = {
  dates: DateInput[];
};

export async function loadRestaurantsForSearch(
  db: Knex<any, unknown[]>,
  { dates }: LoadRestaurantsForSearchParameters,
): Promise<{ [key: number]: Restaurant }> {
  const result: { [key: number]: Restaurant } = {};

  const restaurantRecords = await db("restaurants").select("id", "name");
  const restaurantIds = restaurantRecords.map(({ id }) => id);

  const configs = await loadRestaurantConfigsByRestaurantId(db, restaurantIds);
  const endorsementsByRestaurantId = await loadEndorsementsByRestaurantId(
    db,
    restaurantIds,
  );
  const tablesByRestaurantId = await loadTablesByRestaurantId(
    db,
    restaurantIds,
  );
  const reservationWindowTemplates =
    await loadReservationWindowTemplatesByRestaurantId(db, restaurantIds);

  for (const { id, name } of restaurantRecords) {
    const zone = configs[id]?.zone || DEFAULT_TIME_ZONE;

    const restaurant: Restaurant = {
      id,
      name,
      tables: tablesByRestaurantId[id],
      endorsements: endorsementsByRestaurantId[id],
      zone,
      reservationWindows: generateReservationWindows({
        zone,
        dates,
        windowTemplates: reservationWindowTemplates[id],
      }),
    };

    result[id] = restaurant;
  }

  return result;
}

type RestaurantConfig = {
  zone: string;
};

type RestaurantConfigRecord = {
  restaurant_id: number;
  zone: string;
};

async function loadRestaurantConfigsByRestaurantId(
  db: Knex<any, unknown[]>,
  restaurantIds: number[],
): Promise<{ [key: number]: RestaurantConfig }> {
  const restaurantConfigRecords = await db<RestaurantConfigRecord>(
    "restaurant_configs",
  )
    .select("restaurant_id", "zone")
    .whereIn("restaurant_id", restaurantIds);

  return restaurantConfigRecords.reduce(
    (restaurantConfigsByRestaurantId, { restaurant_id, zone }) => {
      restaurantConfigsByRestaurantId[restaurant_id] = { zone };
      return restaurantConfigsByRestaurantId;
    },
    {} as { [key: number]: RestaurantConfig },
  );
}

type ReservationWindowRecord = {
  restaurant_id: number;
  start_hour: number;
  end_hour: number;
};

type ReservationWindowTemplate = {
  startHour: number;
  endHour: number;
};

async function loadReservationWindowTemplatesByRestaurantId(
  db: Knex<any, unknown[]>,
  restaurantIds: number[],
): Promise<{ [key: number]: ReservationWindowTemplate[] }> {
  const reservationWindowRecords = await db<ReservationWindowRecord>(
    "restaurants_reservation_windows",
  )
    .select("restaurant_id", "start_hour", "end_hour")
    .whereIn("restaurant_id", restaurantIds);

  return reservationWindowRecords.reduce(
    (
      reservationWindowsByRestaurantId,
      { restaurant_id, start_hour, end_hour },
    ) => {
      reservationWindowsByRestaurantId[restaurant_id] ||= [];
      reservationWindowsByRestaurantId[restaurant_id].push({
        startHour: start_hour,
        endHour: end_hour,
      });
      return reservationWindowsByRestaurantId;
    },
    {} as { [key: number]: ReservationWindowTemplate[] },
  );
}

type RestaurantEndorsementRecord = {
  restaurant_id: number;
  endorsement_id: number;
};

type EndorsementRecord = {
  id: number;
  tag: string;
};

async function loadEndorsementsByRestaurantId(
  db: Knex<any, unknown[]>,
  restaurantIds: number[],
): Promise<{ [key: number]: Endorsement[] }> {
  const restaurantEndorsementRecords = await db<RestaurantEndorsementRecord>(
    "restaurants_endorsements",
  )
    .select("restaurant_id", "endorsement_id")
    .whereIn("restaurant_id", restaurantIds);
  const endorsementRecords = await db<EndorsementRecord>("endorsements")
    .select("id", "tag")
    .whereIn(
      "id",
      restaurantEndorsementRecords.map(({ endorsement_id }) => endorsement_id),
    );

  const endorsementIdsByRestaurantId = restaurantEndorsementRecords.reduce(
    (endorsementsByRestaurantId, { restaurant_id, endorsement_id }) => {
      endorsementsByRestaurantId[restaurant_id] ||= {};
      endorsementsByRestaurantId[restaurant_id][endorsement_id] = true;
      return endorsementsByRestaurantId;
    },
    {} as { [key: number]: { [key: number]: boolean } },
  );

  const endorsementsByRestaurantId: { [key: number]: Endorsement[] } = {};
  for (const restaurantId of restaurantIds) {
    endorsementsByRestaurantId[restaurantId] = endorsementRecords
      .filter(({ id: endorsementId }) => {
        if (!endorsementIdsByRestaurantId[restaurantId]) return false;
        return endorsementIdsByRestaurantId[restaurantId][endorsementId];
      })
      .map(({ id, tag }) => {
        return { id, tag };
      });
  }
  return endorsementsByRestaurantId;
}

type TableRecord = {
  id: number;
  restaurant_id: number;
  capacity: number;
  minimum: number;
};

async function loadTablesByRestaurantId(
  db: Knex<any, unknown[]>,
  restaurantIds: number[],
) {
  const tableRecords = await db<TableRecord>("tables")
    .select("id", "restaurant_id", "capacity", "minimum")
    .whereIn("restaurant_id", restaurantIds);
  const tableIds = tableRecords.map(({ id }) => id);

  const reservationsByTableId = await loadReservationsByTableId(db, tableIds);

  return tableRecords.reduce(
    (tablesByRestaurantId, { id, restaurant_id, capacity, minimum }) => {
      const reservations = reservationsByTableId[id] || [];
      tablesByRestaurantId[restaurant_id] ||= [];
      tablesByRestaurantId[restaurant_id].push({
        id,
        capacity,
        minimum,
        reservations,
      });
      return tablesByRestaurantId;
    },
    {} as { [key: number]: Table[] },
  );
}

type ReservationRecord = {
  id: number;
  table_id: number;
  start: string;
  end: string;
  canceled: boolean;
};

async function loadReservationsByTableId(
  db: Knex<any, unknown[]>,
  tableIds: number[],
): Promise<{ [key: number]: Reservation[] }> {
  const reservationRecords = await db<ReservationRecord>("reservations")
    .select("id", "table_id", "start", "end", "canceled")
    .whereIn("table_id", tableIds);
  const reservationIds = reservationRecords.map(({ id }) => id);

  const dinerIdsByReservationId = await loadDinerIdsByReservationId(
    db,
    reservationIds,
  );

  const reservationsByTableId = reservationRecords.reduce(
    (reservationsByTableId, { id, table_id, start, end }) => {
      reservationsByTableId[table_id] ||= [];
      reservationsByTableId[table_id].push({
        id,
        start: DateTime.fromISO(start),
        end: DateTime.fromISO(end),
        dinerIds: dinerIdsByReservationId[id],
      });
      return reservationsByTableId;
    },
    {} as { [key: number]: Reservation[] },
  );

  return reservationsByTableId;
}

type DinerReservationRecord = {
  diner_id: number;
  reservation_id: number;
};

async function loadDinerIdsByReservationId(
  db: Knex<any, unknown[]>,
  reservationIds: number[],
): Promise<{ [key: number]: number[] }> {
  const dinerReservationRecords = await db<DinerReservationRecord>(
    "diners_reservations",
  )
    .select("diner_id", "reservation_id")
    .whereIn("reservation_id", reservationIds);

  return dinerReservationRecords.reduce(
    (dinerIdsByReservationId, { diner_id, reservation_id }) => {
      dinerIdsByReservationId[reservation_id] ||= [];
      dinerIdsByReservationId[reservation_id].push(diner_id);
      return dinerIdsByReservationId;
    },
    {} as { [key: number]: number[] },
  );
}

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

// type AvailableTimesParameters = {
//   capacity: number;
//   start: DateTime;
//   end: DateTime;
// };

// export function availableTables(
//   restaurant: Restaurant,
//   params: AvailableTimesParameters,
// ): number[] {
//   if (restaurant.reservationWindows.length === 0) return [];
//   if (!restaurantAcceptsReservationsStarting(restaurant, params.start)) {
//     return [];
//   }
//
//   const results = [];
//   for (const table of restaurant.tables) {
//     if (table.capacity < params.capacity) continue;
//     if (table.minimum > params.capacity) continue;
//     if (tableReservedAt(table, params.start)) continue;
//
//     results.push(table.id);
//   }
//   return results;
// }

// export function restaurantAcceptsReservationsStarting(
//   restaurant: Restaurant,
//   start: DateTime,
// ): boolean {
//   if (restaurant.reservationWindows.length === 0) return false;
//
//   for (const reservationWindow of restaurant.reservationWindows) {
//     if (start < reservationWindow.start || start > reservationWindow.end)
//       return false;
//   }
//
//   return true;
// }

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
  dinerIds: number[];
  start: DateTime;
  end: DateTime;
};
