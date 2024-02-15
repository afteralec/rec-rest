import type { Knex } from "knex";

import type { Endorsement } from ".";

export type EndorsementRecord = {
  id: number;
  tag: string;
};

export type RestaurantEndorsementRecord = {
  restaurant_id: number;
  endorsement_id: number;
};

export async function loadEndorsementsByRestaurantId(
  db: Knex<any, unknown[]>,
  restaurantIds: number[],
): Promise<{ [key: number]: Endorsement[] }> {
  const restaurantEndorsementRecords = await db<RestaurantEndorsementRecord>(
    "restaurants_endorsements",
  )
    .select("restaurant_id", "endorsement_id")
    .whereIn("restaurant_id", restaurantIds);
  const endorsementRecords = await db<EndorsementRecord>("endorsements")
    .select("id", "tag")
    .whereIn(
      "id",
      restaurantEndorsementRecords.map(({ endorsement_id }) => endorsement_id),
    );

  const endorsementIdsByRestaurantId = restaurantEndorsementRecords.reduce(
    (endorsementsByRestaurantId, { restaurant_id, endorsement_id }) => {
      endorsementsByRestaurantId[restaurant_id] ||= {};
      endorsementsByRestaurantId[restaurant_id][endorsement_id] = true;
      return endorsementsByRestaurantId;
    },
    {} as { [key: number]: { [key: number]: boolean } },
  );

  const endorsementsByRestaurantId: { [key: number]: Endorsement[] } = {};
  for (const restaurantId of restaurantIds) {
    endorsementsByRestaurantId[restaurantId] = endorsementRecords
      .filter(({ id: endorsementId }) => {
        if (!endorsementIdsByRestaurantId[restaurantId]) return false;
        return endorsementIdsByRestaurantId[restaurantId][endorsementId];
      })
      .map(({ id, tag }) => {
        return { id, tag };
      });
  }
  return endorsementsByRestaurantId;
}

type DinersEndorsementsRecord = {
  diner_id: number;
  endorsement_id: number;
};

export async function loadEndorsementsByDinerId(
  db: Knex<any, unknown[]>,
  dinerIds: number[],
): Promise<{ [key: number]: Endorsement[] }> {
  const dinerEndorsementRecords = await db<DinersEndorsementsRecord>(
    "diners_endorsements",
  )
    .select("diner_id", "endorsement_id")
    .whereIn("diner_id", dinerIds);
  const endorsementIds = dinerEndorsementRecords.map(
    ({ endorsement_id }) => endorsement_id,
  );
  const endorsementRecords = await db<EndorsementRecord>("endorsements")
    .select("id", "tag")
    .whereIn("id", endorsementIds);

  const endorsementIdsByDinerId = dinerEndorsementRecords.reduce(
    (endorsementIdsByDinerId, { diner_id, endorsement_id }) => {
      endorsementIdsByDinerId[diner_id] ||= {};
      endorsementIdsByDinerId[diner_id][endorsement_id] = true;
      return endorsementIdsByDinerId;
    },
    {} as { [key: number]: { [key: number]: boolean } },
  );

  const endorsementsByDinerId: { [key: number]: Endorsement[] } = {};
  for (const dinerId of dinerIds) {
    endorsementsByDinerId[dinerId] = endorsementRecords
      .filter(({ id: endorsementId }) => {
        if (!endorsementIdsByDinerId[dinerId]) return false;
        return endorsementIdsByDinerId[dinerId][endorsementId];
      })
      .map(({ id, tag }) => {
        return { id, tag };
      });
  }
  return endorsementsByDinerId;
}
