import express from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import knex from "knex";

import { loadRestaurantsForSearch } from "./restaurants";

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
  day: number;
  month: number;
  year: number;
};

function isDateInputValid(input: any): input is DateInput {
  if (!("day" in input)) return false;
  if (typeof input.day != "number") return false;

  if (!("month" in input)) return false;
  if (typeof input.month != "number") return false;

  if (!("year" in input)) return false;
  if (typeof input.year != "number") return false;

  return true;
}

type SearchInput = {
  diners: string[];
  dates: DateInput[];
};

function isSearchInputValid(input: any): input is SearchInput {
  if (!("diners" in input)) return false;
  if (!Array.isArray(input.diners)) return false;
  if (input.diners.length === 0) return false;
  if (typeof input.diners[0] != "string") return false;

  if (!("dates" in input)) return false;
  if (!Array.isArray(input.dates)) return false;
  if (input.dates.length === 0) return false;
  if (!isDateInputValid(input.dates[0])) return false;

  return true;
}

app.post(
  "/reservations/search",
  asyncHandler(async (req, res, _next) => {
    const input: SearchInput | any = Object.assign({}, req.body);

    if (!isSearchInputValid(input)) {
      res.status(400);
      res.json('{ message: "Please provide a valid list of diners" }');
      return;
    }

    const restaurants = await loadRestaurantsForSearch(db, {
      dates: input.dates,
    });
    console.dir(restaurants);

    const dinerIDs = await db("diners")
      .whereIn("name", req.body.diners)
      .select("id");
    const dinerReservations = await db("diners_reservations")
      .whereIn(
        "diner_id",
        dinerIDs.map(({ id }) => id),
      )
      .select("diner_id", "reservation_id");

    const reservations = await db("reservations")
      .whereIn(
        "id",
        dinerReservations.map(({ reservation_id }) => reservation_id),
      )
      .select("id", "start", "end");

    res.status(200);
    res.json('{ message: "Success." }');
  }),
);

app.listen(PORT, () => {
  console.log(`Rest is now listening on port ${PORT}`);
});
