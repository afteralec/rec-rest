import type { Diner } from "../diners";

export {
  loadEndorsementsByRestaurantId,
  loadEndorsementsByDinerId,
} from "./load";

export type Endorsement = {
  id: number;
  tag: string;
};

export function buildDinerEndorsementsForSearch(diners: Diner[]): {
  [key: string]: boolean;
} {
  return diners.reduce(
    (dinerEndorsementsForSearch, { endorsements }) => {
      for (const endorsement of endorsements) {
        dinerEndorsementsForSearch[endorsement.tag] = true;
      }
      return dinerEndorsementsForSearch;
    },
    {} as { [key: string]: boolean },
  );
}
