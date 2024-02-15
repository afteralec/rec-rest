import { describe, test } from "vitest";
import axios from "axios";

describe("The reserve endpoint", () => {
  test("the reserve endpoint is callable with the correct input", async () => {
    const response = await axios.post("http://localhost:9090/reservations", {
      restaurantId: 5,
      zone: "America/New_York",
      diners: ["Michael", "Gob"],
      date: { month: 2, day: 20, year: 2024, hour: 17 },
    });
    console.dir(JSON.parse(response.data));
  });
});
