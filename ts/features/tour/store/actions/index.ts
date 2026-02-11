import { ActionType, createStandardAction } from "typesafe-actions";
import { TourItem } from "../../types";

export const registerTourItemAction =
  createStandardAction("TOUR_REGISTER_ITEM")<TourItem>();

export const unregisterTourItemAction = createStandardAction(
  "TOUR_UNREGISTER_ITEM"
)<TourItem>();

export type TourActions =
  | ActionType<typeof registerTourItemAction>
  | ActionType<typeof unregisterTourItemAction>;
