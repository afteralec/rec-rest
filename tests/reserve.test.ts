import { describe, test, expect } from "vitest";
import axios from "axios";

describe("Reserve inputs", () => {
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
