// disabled in order to allows comments between the switch
import { getType } from "typesafe-actions";

import { mixpanelTrack } from "../../../mixpanel";
import { Action } from "../../../store/actions/types";
import { buildEventProperties } from "../../../utils/analytics";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationPinReset,
  identificationRequest,
  identificationStart,
  identificationSuccess
} from "../store/actions";

export const trackIdentificationAction = (
  action: Action
): ReadonlyArray<null> | void => {
  switch (action.type) {
    // identification
    // identificationSuccess is handled separately
    // because it has a payload.
    case getType(identificationCancel):
    case getType(identificationFailure):
    case getType(identificationForceLogout):
    case getType(identificationPinReset):
    case getType(identificationRequest):
    case getType(identificationStart):
      return mixpanelTrack(action.type);

    // identification: identificationSuccess
    case getType(identificationSuccess):
      return mixpanelTrack(
        action.type,
        buildEventProperties("UX", "confirm", {
          identification_method: action.payload.isBiometric ? "bio" : "pin"
        })
      );
  }
};
