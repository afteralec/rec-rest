export {
  loadEndorsementsByRestaurantId,
  loadEndorsementsByDinerId,
} from "./load";

export type Endorsement = {
  id: number;
  tag: string;
};
