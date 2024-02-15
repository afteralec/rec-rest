import { describe, test } from "vitest";
import axios from "axios";

describe("The search endpoint", () => {
  test("the search endpoint is callable with the correct input", async () => {
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
    console.dir(JSON.parse(response.data));
  });
});
