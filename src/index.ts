import express from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import knex from "knex";
import { DateTime } from "luxon";

import { isSearchInputValid, isReserveInputValid } from "./input";
import { loadDinersForSearch } from "./diners";
import { loadRestaurantsForSearch, availableTables } from "./restaurants";
import { buildDinerEndorsementsForSearch } from "./endorsements";
import type { SearchInput, ReserveInput } from "./input";

const RESERVATION_DURATION_HOURS = 2;

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
