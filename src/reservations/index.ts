import { DateTime } from "luxon";

export { loadReservationsByTableId, loadReservationsByDinerId } from "./load";
export { saveReservation } from "./save";

export type Reservation = {
  id: number;
  dinerIds: number[];
  start: DateTime;
  end: DateTime;
};
