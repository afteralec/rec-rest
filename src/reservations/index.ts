import { DateTime } from "luxon";

export { loadReservationsByTableId, loadReservationsByDinerId } from "./load";
export { saveReservation } from "./save";
export { deleteReservation } from "./delete";

export type Reservation = {
  id: number;
  dinerIds: number[];
  start: DateTime;
  end: DateTime;
};
