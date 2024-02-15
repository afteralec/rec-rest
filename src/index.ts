import express from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import knex from "knex";
import { DateTime } from "luxon";

import { loadDinersForSearch } from "./diners";
import { loadRestaurantsForSearch, availableTables } from "./restaurants";
import { buildDinerEndorsementsForSearch } from "./endorsements";

const RESERVATION_DURATION_HOURS = 2;

const ZONE_AMERICA_LOS_ANGELES = "America/Los_Angeles" as const;
const ZONE_AMERICA_DENVER = "America/New_York" as const;

type Zone = typeof ZONE_AMERICA_LOS_ANGELES | typeof ZONE_AMERICA_DENVER;
const VALID_ZONES: { [key in Zone]: boolean } = {
  [ZONE_AMERICA_LOS_ANGELES]: true,
  [ZONE_AMERICA_DENVER]: true,
};

dotenv.config();

const DEFAULT_PORT = 9080;
const PORT = process.env.REST_APP_PORT || DEFAULT_PORT;

const app = express();
app.use(express.json());

const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./db/rest.db",
  },
  useNullAsDefault: true,
});

export type DateInput = {
  hour: number;
  day: number;
  month: number;
  year: number;
  zone: string;
};

type SearchInput = {
  diners: string[];
  dates: DateInput[];
  zone: Zone;
};

type ReserveInput = {
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

function isZoneValid(zone: any): zone is Zone {
  if (typeof zone != "string") return false;
  if (!VALID_ZONES[zone as Zone]) return false;

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
function isSearchInputValid(input: any): input is SearchInput {
  if (!("diners" in input)) return false;
  if (!isDinersArrayValid(input.diners)) return false;

  if (!("dates" in input)) return false;
  if (!isDateInputArrayValid(input.dates)) return false;

  if (!("zone" in input)) return false;
  if (!isZoneValid(input.zone)) return false;

  return true;
}

function isReserveInputValid(input: any): input is ReserveInput {
  if (!("diners" in input)) return false;
  if (!isDinersArrayValid(input.diners)) return false;

  if (!("date" in input)) return false;
  if (!isDateInputValid(input.date)) return false;

  return true;
}

app.post(
  "/reservations/search",
  asyncHandler(async (req, res, _next) => {
    const input: SearchInput | any = Object.assign({}, req.body);
    if (!isSearchInputValid(input)) {
      res.status(400);
      res.json('{ message: "please provide a valid input" }');
      return;
    }

    const diners = await loadDinersForSearch(db, { names: input.diners });
    const dinersList = Object.values(diners);
    const capacity = dinersList.length;
    const dinerEndorsements = buildDinerEndorsementsForSearch(
      Object.values(diners),
    );

    const restaurants = await loadRestaurantsForSearch(db, {
      dates: input.dates,
      dinerEndorsements,
    });
    const restaurantsList = Object.values(restaurants);

    const reservationsAvailable = [];
    for (const dateInput of input.dates) {
      const start = DateTime.fromObject(dateInput);
      const end = start.plus({ hours: RESERVATION_DURATION_HOURS });

      for (const restaurant of restaurantsList) {
        const tables = availableTables(restaurant, {
          capacity,
          start: start.setZone(restaurant.zone),
          end,
        });

        for (const table of tables) {
          const availableReservationStart = DateTime.fromObject(
            dateInput,
          ).setZone(restaurant.zone);

          const availableReservation = {
            restaurantName: restaurant.name,
            capacity: table.capacity,
            endorsements: restaurant.endorsements,
            start: availableReservationStart.setZone(input.zone).toISO(),
          };

          reservationsAvailable.push(availableReservation);
        }
      }
    }

    const response = {
      reservationsAvailable,
    };

    let json;
    try {
      json = JSON.stringify(response);
    } catch {
      res.status(500);
      res.json('{ "message": "Something\'s gone terribly wrong." }');
      return;
    }

    res.status(200);
    res.json(json);
    return;
  }),
);

app.post(
  "/reservations",
  asyncHandler(async (req, res, _next) => {
    const input: ReserveInput | any = Object.assign({}, req.body);
    if (!isReserveInputValid(input)) {
      res.status(400);
      res.json('{ message: "please provide a valid input" }');
      return;
    }

    res.status(200);
    res.json('{ message: "Success." }');
    return;
  }),
);

app.delete(
  "/reservations",
  asyncHandler(async (_req, res, _next) => {
    res.status(200);
    res.json('{ message: "Success." }');
    return;
  }),
);

app.listen(PORT, () => {
  console.log(`Rest is now listening on port ${PORT}`);
});
