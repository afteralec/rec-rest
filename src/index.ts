import express from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import knex from "knex";
import { DateTime } from "luxon";

import { isSearchInputValid, isReserveInputValid } from "./input";
import { loadDinersForSearch, dinerCanReserveAt } from "./diners";
import { loadRestaurantsForSearch, availableReservations } from "./restaurants";
import { saveReservation, deleteReservation } from "./reservations";
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
      res.json('{ "message": "please provide a valid input" }');
      return;
    }

    const diners = await loadDinersForSearch(db, { names: input.diners });
    const dinersList = Object.values(diners);

    for (const name of input.diners) {
      if (!dinersList.map(({ name }) => name).includes(name)) {
        res.status(404);
        res.json(`{ "message": The diner ${name} is not in the system }`);
        return;
      }
    }

    const dinerEndorsements = buildDinerEndorsementsForSearch(
      Object.values(diners),
    );

    const restaurants = await loadRestaurantsForSearch(db, {
      dates: input.dates,
      dinerEndorsements,
    });
    const restaurantsList = Object.values(restaurants);

    const reservationsAvailable = availableReservations(restaurantsList, {
      dates: input.dates,
      capacity: dinersList.length,
      zone: input.zone,
      durationHours: RESERVATION_DURATION_HOURS,
    });

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

    const diners = await loadDinersForSearch(db, { names: input.diners });
    const dinersList = Object.values(diners);
    const dinerEndorsements = buildDinerEndorsementsForSearch(
      Object.values(diners),
    );

    for (const name of input.diners) {
      if (!dinersList.map(({ name }) => name).includes(name)) {
        res.status(404);
        res.json(`{ "message": The diner ${name} is not in the system }`);
        return;
      }
    }

    const start = DateTime.fromObject(input.date, { zone: input.zone });
    const end = start.plus({ hours: RESERVATION_DURATION_HOURS });

    for (const diner of dinersList) {
      if (!dinerCanReserveAt(diner, { start, end })) {
        res.status(401);
        res.json(
          '{ "message": "That diner already has a reservation at that time." }',
        );
        return;
      }
    }

    const restaurants = await loadRestaurantsForSearch(db, {
      dates: [input.date],
      dinerEndorsements,
      restaurantId: input.restaurantId,
    });
    const restaurantsList = Object.values(restaurants);

    if (restaurantsList.length === 0) {
      res.status(404);
      res.json(
        `{ message: 'There are no restaurants with id ${input.restaurantId} and that match these diners\' endorsement requirements }`,
      );
      return;
    }

    const reservationsAvailable = availableReservations(restaurantsList, {
      dates: [input.date],
      capacity: dinersList.length,
      zone: input.zone,
      durationHours: RESERVATION_DURATION_HOURS,
    });

    if (reservationsAvailable.length === 0) {
      res.status(401);
      res.json("{ 'message': 'That time isn't available to reserve.' }");
      return;
    }

    for (const { tableId } of reservationsAvailable) {
      let reservationId;
      try {
        reservationId = await saveReservation(db, {
          tableId,
          dinerIds: dinersList.map(({ id }) => id),
          start,
          end,
        });
      } catch {
        res.status(500);
        res.json('{ "message": "Something\'s gone terribly wrong." }');
        return;
      }

      res.status(200);
      res.json(
        `{ "message": "Success!", "reservationId": "${reservationId}" }`,
      );
      return;
    }

    res.status(401);
    res.json("{ 'message': 'That time isn't available to reserve.' }");
    return;
  }),
);

app.delete(
  "/reservations/:id",
  asyncHandler(async (req, res, _next) => {
    const { id } = req.params;

    const reservationRecords = await db("reservations")
      .select("id")
      .where("id", id);
    if (reservationRecords.length === 0) {
      res.status(404);
      res.json(`{ "message": "There is no reservation with an id of ${id}"}`);
      return;
    }

    try {
      await deleteReservation(db, +id);
    } catch {
      res.status(500);
      res.json('{ "message": "Something\'s gone terribly wrong." }');
      return;
    }

    res.status(200);
    res.json('{ message: "Success." }');
    return;
  }),
);

app.listen(PORT, () => {
  console.log(`Rest is now listening on port ${PORT}`);
});
