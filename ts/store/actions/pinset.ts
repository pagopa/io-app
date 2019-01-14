/**
 * Action types and action creator related to setting and resetting the PIN.
 */

import { ActionType, createStandardAction } from "typesafe-actions";
import { PinString } from "../../types/PinString";

export const startPinReset = createStandardAction("START_PIN_RESET")();

export const createPinSuccess = createStandardAction("CREATE_PIN_SUCCESS")<
  PinString
>();

export type PinSetActions = ActionType<
  typeof startPinReset | typeof createPinSuccess
>;
