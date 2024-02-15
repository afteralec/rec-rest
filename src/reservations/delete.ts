import type { Knex } from "knex";

export async function deleteReservation(db: Knex<any, unknown[]>, id: number) {
  await db("reservations").delete().where("id", id);
  await db("diners_reservations").delete().where("reservation_id", id);
}
