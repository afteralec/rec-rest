import { DateTime } from "luxon";

export { loadReservationsByTableId, loadReservationsByDinerId } from "./load";

export type Reservation = {
  id: number;
  dinerIds: number[];
  start: DateTime;
  end: DateTime;
};
