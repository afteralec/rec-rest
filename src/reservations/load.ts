import { DateTime } from "luxon";
import type { Knex } from "knex";

import type { Reservation } from ".";

export type ReservationRecord = {
  id: number;
  table_id: number;
  start: string;
  end: string;
};

type DinerReservationRecord = {
  diner_id: number;
  reservation_id: number;
};

export async function loadReservationsByTableId(
  db: Knex<any, unknown[]>,
  tableIds: number[],
): Promise<{ [key: number]: Reservation[] }> {
  const reservationRecords = await db<ReservationRecord>("reservations")
    .select("id", "table_id", "start", "end")
    .whereIn("table_id", tableIds);
  const reservationIds = reservationRecords.map(({ id }) => id);

  const dinerIdsByReservationId = await loadDinerIdsByReservationId(
    db,
    reservationIds,
  );

  const reservationsByTableId = reservationRecords.reduce(
    (reservationsByTableId, { id, table_id, start, end }) => {
      reservationsByTableId[table_id] ||= [];
      reservationsByTableId[table_id].push({
        id,
        start: DateTime.fromISO(start),
        end: DateTime.fromISO(end),
        dinerIds: dinerIdsByReservationId[id],
      });
      return reservationsByTableId;
    },
    {} as { [key: number]: Reservation[] },
  );

  return reservationsByTableId;
}

export async function loadReservationsByDinerId(
  db: Knex<any, unknown[]>,
  dinerIds: number[],
): Promise<{ [key: number]: Reservation[] }> {
  const dinerReservationRecords = await db<DinerReservationRecord>(
    "diners_reservations",
  )
    .select("diner_id", "reservation_id")
    .whereIn("diner_id", dinerIds);
  const reservationIds = dinerReservationRecords.map(
    ({ reservation_id }) => reservation_id,
  );

  const reservationRecords = await db<ReservationRecord>("reservations")
    .select("id", "table_id", "start", "end")
    .whereIn("id", reservationIds);

  const dinerIdsByReservationId = await loadDinerIdsByReservationId(
    db,
    reservationIds,
  );

  const reservationIdsByDinerId = dinerReservationRecords.reduce(
    (reservationIdsByDinerId, { diner_id, reservation_id }) => {
      reservationIdsByDinerId[diner_id] ||= {};
      reservationIdsByDinerId[diner_id][reservation_id] = true;
      return reservationIdsByDinerId;
    },
    {} as { [key: number]: { [key: number]: boolean } },
  );

  const reservationsByDinerId: { [key: number]: Reservation[] } = {};
  for (const dinerId of dinerIds) {
    reservationsByDinerId[dinerId] = reservationRecords
      .filter(({ id: reservationId }) => {
        if (!reservationIdsByDinerId[dinerId]) return false;
        return reservationIdsByDinerId[dinerId][reservationId];
      })
      .map(({ id, start, end }) => {
        return {
          id,
          start: DateTime.fromISO(start),
          end: DateTime.fromISO(end),
          dinerIds: dinerIdsByReservationId[id],
        };
      });
  }
  return reservationsByDinerId;
}

export async function loadDinerIdsByReservationId(
  db: Knex<any, unknown[]>,
  reservationIds: number[],
): Promise<{ [key: number]: number[] }> {
  const dinerReservationRecords = await db<DinerReservationRecord>(
    "diners_reservations",
  )
    .select("diner_id", "reservation_id")
    .whereIn("reservation_id", reservationIds);

  return dinerReservationRecords.reduce(
    (dinerIdsByReservationId, { diner_id, reservation_id }) => {
      dinerIdsByReservationId[reservation_id] ||= [];
      dinerIdsByReservationId[reservation_id].push(diner_id);
      return dinerIdsByReservationId;
    },
    {} as { [key: number]: number[] },
  );
}
