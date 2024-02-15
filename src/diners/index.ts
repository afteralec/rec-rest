import type { DateTime } from "luxon";

import type { Endorsement } from "../endorsements";
import type { Reservation } from "../reservations";

export { loadDinersForSearch } from "./load";

export type Diner = {
  id: number;
  name: string;
  endorsements: Endorsement[];
  reservations: Reservation[];
};

type DinerCanReserveAtParameters = {
  start: DateTime;
  end: DateTime;
};

export function dinerCanReserveAt(
  diner: Diner,
  params: DinerCanReserveAtParameters,
): boolean {
  if (diner.reservations.length === 0) return true;

  for (const reservation of diner.reservations) {
    if (params.start >= reservation.start && params.start <= reservation.end) {
      return false;
    }
    if (params.end >= reservation.start && params.end <= reservation.end) {
      return false;
    }
  }

  return true;
}
