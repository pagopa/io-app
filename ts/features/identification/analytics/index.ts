// disabled in order to allows comments between the switch
import { getType } from "typesafe-actions";
import { mixpanel } from "../../../mixpanel";
import { Action } from "../../../store/actions/types";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationPinReset,
  identificationRequest,
  identificationStart,
  identificationSuccess
} from "../store/actions";
import { buildEventProperties } from "../../../utils/analytics";

export const trackIdentificationAction =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): void | ReadonlyArray<null> => {
    switch (action.type) {
      // identification
      // identificationSuccess is handled separately
      // because it has a payload.
      case getType(identificationRequest):
      case getType(identificationStart):
      case getType(identificationCancel):
      case getType(identificationFailure):
      case getType(identificationPinReset):
      case getType(identificationForceLogout):
        return mp.track(action.type);

      // identification: identificationSuccess
      case getType(identificationSuccess):
        return mp.track(
          action.type,
          buildEventProperties("UX", "confirm", {
            identification_method: action.payload.isBiometric ? "bio" : "pin"
          })
        );
    }
  };
