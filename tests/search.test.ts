import { describe, test, expect } from "vitest";
import axios from "axios";

describe("Search", () => {
  test("Searching with valid input returns a success code", async () => {
    const dates = [];
    for (let hour = 0; hour <= 24; hour++) {
      dates.push({
        month: 2,
        day: 20,
        year: 2024,
        hour,
      });
    }

    const response = await axios.post(
      "http://localhost:9090/reservations/search",
      {
        zone: "America/New_York",
        diners: ["Michael", "Gob"],
        dates,
      },
    );

    expect(response.status).toBe(200);
  });

  test.fails("Searching without a zone returns an error code", async () => {
    const dates = [];
    for (let hour = 0; hour <= 24; hour++) {
      dates.push({
        month: 2,
        day: 20,
        year: 2024,
        hour,
      });
    }

    await axios.post("http://localhost:9090/reservations/search", {
      diners: ["Michael", "Gob"],
      dates,
    });
  });

  test.fails(
    "Searching with an invalid zone returns an error code",
    async () => {
      const dates = [];
      for (let hour = 0; hour <= 24; hour++) {
        dates.push({
          month: 2,
          day: 20,
          year: 2024,
          hour,
        });
      }

      await axios.post("http://localhost:9090/reservations/search", {
        zone: "MiddleEarth/Gondor", // Calls for aid, btw
        diners: ["Michael", "Gob"],
        dates,
      });
    },
  );

  test.fails("Searching without dates returns an error code", async () => {
    await axios.post("http://localhost:9090/reservations/search", {
      zone: "America/New_York",
      diners: ["Michael", "Gob"],
    });
  });

  test.fails("Searching with empty dates returns an error code", async () => {
    await axios.post("http://localhost:9090/reservations/search", {
      zone: "America/New_York",
      diners: ["Michael", "Gob"],
      dates: [],
    });
  });

  test.fails("Searching without diners returns an error code", async () => {
    const dates = [];
    for (let hour = 0; hour <= 24; hour++) {
      dates.push({
        month: 2,
        day: 20,
        year: 2024,
        hour,
      });
    }

    await axios.post("http://localhost:9090/reservations/search", {
      zone: "America/New_York",
      dates,
    });
  });

  test.fails("Searching with empty diners returns an error code", async () => {
    const dates = [];
    for (let hour = 0; hour <= 24; hour++) {
      dates.push({
        month: 2,
        day: 20,
        year: 2024,
        hour,
      });
    }

    await axios.post("http://localhost:9090/reservations/search", {
      zone: "America/New_York",
      diners: [],
      dates,
    });
  });

  test.fails(
    "Searching with a nonexistant diner returns an error code",
    async () => {
      const dates = [];
      for (let hour = 0; hour <= 24; hour++) {
        dates.push({
          month: 2,
          day: 20,
          year: 2024,
          hour,
        });
      }

      await axios.post("http://localhost:9090/reservations/search", {
        zone: "America/New_York",
        diners: ["Lucile", "Aragorn"],
        dates,
      });
    },
  );
});
