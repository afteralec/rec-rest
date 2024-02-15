import type { Knex } from "knex";

import { DEFAULT_ZONE } from "../zone";
import { generateReservationWindows } from ".";
import { loadEndorsementsByRestaurantId } from "../endorsements";
import { loadReservationsByTableId } from "../reservations";
import type {
  Restaurant,
  Table,
  RestaurantConfig,
  ReservationWindowTemplate,
} from ".";
import type { DateInput } from "../input";

type LoadRestaurantsForSearchParameters = {
  dates: DateInput[];
  dinerEndorsements: { [key: string]: boolean };
  restaurantId?: number;
};

export async function loadRestaurantsForSearch(
  db: Knex<any, unknown[]>,
  {
    dates,
    dinerEndorsements,
    restaurantId,
  }: LoadRestaurantsForSearchParameters,
): Promise<{ [key: number]: Restaurant }> {
  const result: { [key: number]: Restaurant } = {};

  let restaurantRecords;
  if (restaurantId) {
    restaurantRecords = await db("restaurants")
      .select("id", "name")
      .where("id", restaurantId);
  } else {
    restaurantRecords = await db("restaurants").select("id", "name");
  }
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
    const zone = configs[id]?.zone || DEFAULT_ZONE;
    const endorsements = endorsementsByRestaurantId[id];

    if (
      !endorsements.find(({ tag }) => {
        return dinerEndorsements[tag];
      })
    ) {
      continue;
    }

    const restaurant: Restaurant = {
      id,
      name,
      tables: tablesByRestaurantId[id],
      endorsements,
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
