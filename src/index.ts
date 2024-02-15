import express from "express";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 9080;
const PORT = process.env.REST_APP_PORT || DEFAULT_PORT;

const app = express();
app.use(express.json());

app.get("/", () => {
  return "Hello, world!";
});

app.get("/reservations/search", () => {});

app.listen(PORT, () => {
  console.log(`Rest is now listening on port ${PORT}`);
});
