import { DateTime } from "luxon";
import type { Knex } from "knex";

export type SaveReservationParameters = {
  tableId: number;
  dinerIds: number[];
  start: DateTime;
  end: DateTime;
};

export async function saveReservation(
  db: Knex<any, unknown[]>,
  { tableId, dinerIds, start, end }: SaveReservationParameters,
): Promise<number> {
  const reservationIds = await db("reservations").insert({
    start: start.toISO(),
    end: end.toISO(),
    table_id: tableId,
  });
  const reservationId = reservationIds[0];

  const dinerReservations = dinerIds.map((dinerId) => {
    return { diner_id: dinerId, reservation_id: reservationId };
  });
  await db("diners_reservations").insert(dinerReservations);

  return reservationId;
}
