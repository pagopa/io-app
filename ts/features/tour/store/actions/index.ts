import { ActionType, createStandardAction } from "typesafe-actions";
import { TourItem } from "../../types";

export const registerTourItemAction =
  createStandardAction("TOUR_REGISTER_ITEM")<TourItem>();

export const unregisterTourItemAction = createStandardAction(
  "TOUR_UNREGISTER_ITEM"
)<TourItem>();

export const startTourAction = createStandardAction("TOUR_START")<{
  groupId: string;
}>();

export const stopTourAction = createStandardAction("TOUR_STOP")();

export const nextTourStepAction = createStandardAction("TOUR_NEXT_STEP")();

export const prevTourStepAction = createStandardAction("TOUR_PREV_STEP")();

export const completeTourAction = createStandardAction("TOUR_COMPLETE")<{
  groupId: string;
}>();

export const resetTourCompletedAction = createStandardAction(
  "TOUR_RESET_COMPLETED"
)<{ groupId: string }>();

export type TourActions =
  | ActionType<typeof registerTourItemAction>
  | ActionType<typeof unregisterTourItemAction>
  | ActionType<typeof startTourAction>
  | ActionType<typeof stopTourAction>
  | ActionType<typeof nextTourStepAction>
  | ActionType<typeof prevTourStepAction>
  | ActionType<typeof completeTourAction>
  | ActionType<typeof resetTourCompletedAction>;
