import { describe, test } from "vitest";
import axios from "axios";

describe("The search endpoint", () => {
  test("the search endpoint is callable with the correct input", async () => {
    await axios.post("http://localhost:9090/reservations/search", {
      diners: ["Michael", "Gob"],
      dates: [{ month: 2, day: 12, year: 2024 }],
    });
  });
});
