import { describe, test, expect } from "vitest";
import axios from "axios";

describe("Full operation integration tests", () => {
  test("can search, save, and delete a reservation given correct inputs", async () => {
    const dates = [];
    for (let hour = 0; hour <= 24; hour++) {
      dates.push({
        month: 2,
        day: 20,
        year: 2024,
        hour,
      });
    }

    const searchResponse = await axios.post(
      "http://localhost:9090/reservations/search",
      {
        zone: "America/New_York",
        diners: ["Michael", "Gob"],
        dates,
      },
    );
    expect(searchResponse.status).toBe(200);

    const saveResponse = await axios.post(
      "http://localhost:9090/reservations",
      {
        restaurantId: 5,
        zone: "America/New_York",
        diners: ["Michael", "Gob"],
        date: { month: 2, day: 20, year: 2024, hour: 17 },
      },
    );

    // This serves as the necessary delete test
    const saveResponseBody = JSON.parse(saveResponse.data);
    const deleteResponse = await axios.delete(
      `http://localhost:9090/reservations/${saveResponseBody.reservationId}`,
    );

    expect(deleteResponse.status).toBe(200);
  });
});
