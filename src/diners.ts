import { DateTime } from "luxon";

import { Endorsement, Reservation } from "./models";

export type DinerWithReservations = {
  id: number;
  name: string;
  requiredEndorsements: Endorsement[];
  reservations: Reservation[];
};

type DinerCanReserveAtParameters = {
  start: DateTime;
  end: DateTime;
};

export function dinerCanReserveAt(
  diner: DinerWithReservations,
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
