import type { Knex } from "knex";

import type { Diner } from ".";
import { loadEndorsementsByDinerId } from "../endorsements";
import { loadReservationsByDinerId, type Reservation } from "../reservations";

export type DinerRecord = {
  id: number;
  name: string;
};

export type LoadDinersForSearchParams = {
  names: string[];
};

export async function loadDinersForSearch(
  db: Knex<any, unknown[]>,
  { names }: LoadDinersForSearchParams,
): Promise<{ [key: number]: Diner }> {
  const result: { [key: number]: Diner } = {};

  const dinerRecords = await db<DinerRecord>("diners")
    .select("id", "name")
    .whereIn("name", names);
  const dinerIds = dinerRecords.map(({ id }) => id);
  const endorsements = await loadEndorsementsByDinerId(db, dinerIds);

  const reservations = await loadReservationsByDinerId(db, dinerIds);

  for (const { id, name } of dinerRecords) {
    const diner = {
      id,
      name,
      endorsements: endorsements[id],
      reservations: reservations[id],
    };

    result[id] = diner;
  }

  return result;
}
