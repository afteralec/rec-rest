import type { Knex } from "knex";

import { generateReservationWindows } from ".";
import { loadEndorsementsByRestaurantId } from "../endorsements";
import { loadReservationsByTableId } from "../reservations";
import type {
  Restaurant,
  Table,
  RestaurantConfig,
  ReservationWindowTemplate,
} from ".";
import type { DateInput } from "..";

const DEFAULT_TIME_ZONE = "America/Los_Angeles";

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
