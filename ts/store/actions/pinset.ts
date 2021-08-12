/**
 * Action types and action creator related to setting and resetting the unlock code.
 */

import { ActionType, createStandardAction } from "typesafe-actions";
import { PinString } from "../../types/PinString";

export const updatePin = createStandardAction("UPDATE_PIN")();

export const createPinSuccess = createStandardAction("CREATE_PIN_SUCCESS")<
  PinString
>();

export type PinSetActions = ActionType<
  typeof createPinSuccess | typeof updatePin
>;
