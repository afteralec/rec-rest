import { describe, test, afterAll } from "vitest";
import knex from "knex";
import axios from "axios";

describe("Reserve inputs", () => {
  // Minor cleanup to keep multiple test runs from failing
  afterAll(async () => {
    const db = knex({
      client: "sqlite3",
      connection: {
        filename: "./db/rest.db",
      },
      useNullAsDefault: true,
    });

    await db("reservations").del();
    await db("diners_reservations").del();
  });

  test("can make a reservation given the correct inputs", async () => {
    await axios.post("http://localhost:9090/reservations", {
      restaurantId: 1,
      zone: "America/New_York",
      diners: ["Tobias", "Lucile"],
      date: { month: 2, day: 24, year: 2024, hour: 17 },
    });
  });

  test.fails(
    "cannot make a reservation if a diner is already reserved at that time",
    async () => {
      await axios.post("http://localhost:9090/reservations", {
        restaurantId: 5,
        zone: "America/New_York",
        diners: ["Gob"],
        date: { month: 2, day: 20, year: 2024, hour: 17 },
      });

      // Mimicking this by trying to post twice to the same time
      await axios.post("http://localhost:9090/reservations", {
        restaurantId: 5,
        zone: "America/New_York",
        diners: ["Gob"],
        date: { month: 2, day: 20, year: 2024, hour: 17 },
      });
    },
  );

  test.fails(
    "cannot make a reservation outside of the reservation window",
    async () => {
      await axios.post("http://localhost:9090/reservations", {
        restaurantId: 5,
        diners: ["Michael", "Gob"],
        date: { month: 2, day: 20, year: 2024, hour: 12 },
      });
    },
  );

  test.fails("Reserving without a zone returns an error code", async () => {
    await axios.post("http://localhost:9090/reservations", {
      restaurantId: 5,
      diners: ["Michael", "Gob"],
      date: { month: 2, day: 20, year: 2024, hour: 17 },
    });
  });

  test.fails(
    "Reserving with an invalid zone returns an error code",
    async () => {
      await axios.post("http://localhost:9090/reservations", {
        restaurantId: 5,
        zone: "MiddleEarth/Mordor",
        diners: ["Michael", "Gob"],
        date: { month: 2, day: 20, year: 2024, hour: 17 },
      });
    },
  );

  test.fails("Reserving without a date returns an error code", async () => {
    await axios.post("http://localhost:9090/reservations", {
      restaurantId: 5,
      zone: "America/New_York",
      diners: ["Michael", "Gob"],
    });
  });

  test.fails(
    "Reserving with an invalid date returns an error code",
    async () => {
      await axios.post("http://localhost:9090/reservations", {
        restaurantId: 5,
        zone: "America/New_York",
        diners: ["Michael", "Gob"],
        date: { year: 2032 },
      });
    },
  );

  test.fails("Reserving without diners returns an error code", async () => {
    await axios.post("http://localhost:9090/reservations", {
      zone: "America/New_York",
      restaurantId: 5,
      date: { month: 2, day: 20, year: 2024, hour: 17 },
    });
  });

  test.fails("Reserving with empty diners returns an error code", async () => {
    await axios.post("http://localhost:9090/reservations", {
      zone: "America/New_York",
      restaurantId: 5,
      diners: [],
      date: { month: 2, day: 20, year: 2024, hour: 17 },
    });
  });

  test.fails(
    "Reserving with a non-existant diner returns an error code",
    async () => {
      await axios.post("http://localhost:9090/reservations", {
        zone: "America/New_York",
        restaurantId: 5,
        diners: ["George Michael", "Tobias", "Samwise"],
        date: { month: 2, day: 20, year: 2024, hour: 17 },
      });
    },
  );
});
