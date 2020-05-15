import { ActionType, createAction } from "typesafe-actions";

import { PinString } from "../../types/PinString";
import {
  IdentificationCancelData,
  IdentificationGenericData,
  IdentificationSuccessData
} from "../reducers/identification";

/**
 * An action dispatched by the screen.
 * The identification saga will intercept it and enrich with the current unlock code.
 */
export const identificationRequest = createAction(
  "IDENTIFICATION_REQUEST",
  resolve => (
    canResetPin: boolean = true,
    isValidatingTask: boolean = false,
    identificationGenericData?: IdentificationGenericData,
    identificationCancelData?: IdentificationCancelData,
    identificationSuccessData?: IdentificationSuccessData,
    shufflePad: boolean = false
  ) =>
    resolve({
      canResetPin,
      isValidatingTask,
      identificationGenericData,
      identificationCancelData,
      identificationSuccessData,
      shufflePad
    })
);

/**
 * Action dispatched internally by the identification saga to start the process.
 */
export const identificationStart = createAction(
  "IDENTIFICATION_START",
  resolve => (
    pin: PinString,
    canResetPin: boolean = true,
    isValidatingTask: boolean = false,
    identificationGenericData?: IdentificationGenericData,
    identificationCancelData?: IdentificationCancelData,
    identificationSuccessData?: IdentificationSuccessData,
    shufflePad: boolean = false
  ) =>
    resolve({
      pin,
      canResetPin,
      isValidatingTask,
      identificationGenericData,
      identificationCancelData,
      identificationSuccessData,
      shufflePad
    })
);

export const identificationCancel = createAction("IDENTIFICATION_CANCEL");
export const identificationSuccess = createAction("IDENTIFICATION_SUCCESS");
export const identificationFailure = createAction("IDENTIFICATION_FAILURE");
export const identificationPinReset = createAction("IDENTIFICATION_PIN_RESET");
export const identificationReset = createAction("IDENTIFICATION_RESET");
export const identificationForceLogout = createAction(
  "IDENTIFICATION_FORCE_LOGOUT"
);

export type IdentificationActions =
  | ActionType<typeof identificationStart>
  | ActionType<typeof identificationRequest>
  | ActionType<typeof identificationCancel>
  | ActionType<typeof identificationSuccess>
  | ActionType<typeof identificationFailure>
  | ActionType<typeof identificationPinReset>
  | ActionType<typeof identificationForceLogout>
  | ActionType<typeof identificationReset>;
