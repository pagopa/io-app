/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  acknowledgeOnEmailValidation,
  emailValidationPollingStart,
  emailValidationPollingStop,
  setEmailCheckAtStartupFailure,
  startEmailValidation
} from "../../../settings/common/store/actions";
import { Action } from "../../../../store/actions/types";

export type EmailValidationState = {
  sendEmailValidationRequest: pot.Pot<void, Error>;
  acknowledgeOnEmailValidated: O.Option<boolean>;
  emailCheckAtStartupFailed: O.Option<boolean>;
  isEmailValidationPollingRunning: boolean;
};

const INITIAL_STATE: EmailValidationState = {
  sendEmailValidationRequest: pot.none,
  acknowledgeOnEmailValidated: O.none,
  emailCheckAtStartupFailed: O.none,
  isEmailValidationPollingRunning: false
};

const reducer = (
  state: EmailValidationState = INITIAL_STATE,
  action: Action
): EmailValidationState => {
  switch (action.type) {
    case getType(startEmailValidation.request):
      return { ...state, sendEmailValidationRequest: pot.noneLoading };
    case getType(startEmailValidation.failure):
      return {
        ...state,
        sendEmailValidationRequest: pot.toError(
          state.sendEmailValidationRequest,
          action.payload
        )
      };
    case getType(startEmailValidation.success):
      return { ...state, sendEmailValidationRequest: pot.some(undefined) };
    case getType(acknowledgeOnEmailValidation):
      return { ...state, acknowledgeOnEmailValidated: action.payload };
    case getType(setEmailCheckAtStartupFailure):
      return { ...state, emailCheckAtStartupFailed: action.payload };
    case getType(emailValidationPollingStart):
      return { ...state, isEmailValidationPollingRunning: true };
    case getType(emailValidationPollingStop):
      return { ...state, isEmailValidationPollingRunning: false };
    default:
      return state;
  }
};

export default reducer;
