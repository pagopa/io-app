import { ActionType, createAction } from "typesafe-actions";

import { PinString } from "../../types/PinString";
import {
  IdentificationCancelData,
  IdentificationSuccessData
} from "../reducers/identification";

/**
 * An action dispatched by the screen.
 * The identification saga will intercept it and enrich with the current pin.
 */
export const identificationRequest = createAction(
  "IDENTIFICATION_REQUEST",
  resolve => (
    identificationCancelData?: IdentificationCancelData,
    identificationSuccessData?: IdentificationSuccessData
  ) =>
    resolve({
      identificationCancelData,
      identificationSuccessData
    })
);

/**
 * Action dispatched internally by the identification saga to start the process.
 */
export const identificationStart = createAction(
  "IDENTIFICATION_START",
  resolve => (
    pin: PinString,
    identificationCancelData?: IdentificationCancelData,
    identificationSuccessData?: IdentificationSuccessData
  ) =>
    resolve({
      pin,
      identificationCancelData,
      identificationSuccessData
    })
);

export const identificationCancel = createAction("IDENTIFICATION_CANCEL");
export const identificationSuccess = createAction("IDENTIFICATION_SUCCESS");
export const identificationFailure = createAction("IDENTIFICATION_FAILURE");
export const identificationPinReset = createAction("IDENTIFICATION_PIN_RESET");
export const identificationReset = createAction("IDENTIFICATION_RESET");

export type IdentificationActions =
  | ActionType<typeof identificationStart>
  | ActionType<typeof identificationRequest>
  | ActionType<typeof identificationCancel>
  | ActionType<typeof identificationSuccess>
  | ActionType<typeof identificationFailure>
  | ActionType<typeof identificationPinReset>
  | ActionType<typeof identificationReset>;
