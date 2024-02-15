import { describe, test, expect } from "vitest";
import { DateTime } from "luxon";
import axios from "axios";

describe("Search results", () => {
  test("Searching with a diner should take into account their endorsements", async () => {
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
        diners: ["Maeby"],
        dates,
      },
    );

    const body = JSON.parse(response.data);
    expect(body.reservationsAvailable.length).toBeGreaterThan(0);

    // Asserting that every reservation contains the Vegan tag, this is Maeby's only
    for (const reservationAvailable of body.reservationsAvailable) {
      expect(
        reservationAvailable.endorsements.find(
          (endorsement: { tag: string }) =>
            endorsement.tag === "Vegan-Friendly",
        ),
      ).toBeTruthy();
    }

    expect(response.status).toBe(200);
  });

  test("Searching should not return reservations with capacity less than the number of diners", async () => {
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
        diners: ["Michael", "Lucile", "Tobias"],
        dates,
      },
    );

    const body = JSON.parse(response.data);
    expect(body.reservationsAvailable.length).toBeGreaterThan(0);

    for (const reservationAvailable of body.reservationsAvailable) {
      expect(reservationAvailable.capacity).not.toBeLessThan(3);
    }

    expect(response.status).toBe(200);
  });

  test("Each search should return a reservation with the input timezone", async () => {
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
        diners: ["Lucile", "Tobias"],
        dates,
      },
    );

    const body = JSON.parse(response.data);
    expect(body.reservationsAvailable.length).toBeGreaterThan(0);

    for (const reservationAvailable of body.reservationsAvailable) {
      const date = DateTime.fromISO(reservationAvailable.start, {
        setZone: true,
      });
      expect(date.zone.name).toBe("UTC-5");
    }

    expect(response.status).toBe(200);
  });

  test("Each search should return a reservation with the correct day", async () => {
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
        diners: ["Lucile", "Tobias"],
        dates,
      },
    );

    const body = JSON.parse(response.data);
    expect(body.reservationsAvailable.length).toBeGreaterThan(0);

    for (const reservationAvailable of body.reservationsAvailable) {
      const date = DateTime.fromISO(reservationAvailable.start, {
        setZone: true,
      });
      expect(date.year).toBe(2024);
      expect(date.day).toBeGreaterThanOrEqual(20);
      expect(date.month).toBe(2);
    }

    expect(response.status).toBe(200);
  });

  test("No search should return a reservation outside of the reservation windows", async () => {
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
        zone: "America/Los_Angeles",
        diners: ["Lucile", "Tobias"],
        dates,
      },
    );

    const body = JSON.parse(response.data);
    expect(body.reservationsAvailable.length).toBeGreaterThan(0);

    for (const reservationAvailable of body.reservationsAvailable) {
      const date = DateTime.fromISO(reservationAvailable.start, {
        setZone: true,
      });
      // This is purely artificial based on the explicit seed of reservations for 4:00pm-9:00pm Pacific
      expect(date.hour).not.toBeLessThan(16);
      expect(date.hour).not.toBeGreaterThan(21);
    }

    expect(response.status).toBe(200);
  });

  test("Searching with a diner should not return reservations where the table has a minimum-seating greater than than the number of diners", async () => {
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
        diners: ["Lucile", "Tobias"],
        dates,
      },
    );

    const body = JSON.parse(response.data);
    expect(body.reservationsAvailable.length).toBeGreaterThan(0);

    for (const reservationAvailable of body.reservationsAvailable) {
      // This is only true since I have all six-tops seeded to minimum 3
      expect(reservationAvailable.capacity).not.toBe(6);
    }

    expect(response.status).toBe(200);
  });
});

describe("Search inputs", () => {
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
