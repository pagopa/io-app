/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import {
  acknowledgeOnEmailValidation,
  emailValidationPollingStart,
  emailValidationPollingStop,
  setEmailCheckAtStartupFailure,
  startEmailValidation
} from "../../../settings/common/store/actions";

export type EmailValidationState = {
  acknowledgeOnEmailValidated: O.Option<boolean>;
  emailCheckAtStartupFailed: O.Option<boolean>;
  isEmailValidationPollingRunning: boolean;
  sendEmailValidationRequest: pot.Pot<void, Error>;
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
    case getType(acknowledgeOnEmailValidation):
      return { ...state, acknowledgeOnEmailValidated: action.payload };
    case getType(emailValidationPollingStart):
      return { ...state, isEmailValidationPollingRunning: true };
    case getType(emailValidationPollingStop):
      return { ...state, isEmailValidationPollingRunning: false };
    case getType(setEmailCheckAtStartupFailure):
      return { ...state, emailCheckAtStartupFailed: action.payload };
    case getType(startEmailValidation.failure):
      return {
        ...state,
        sendEmailValidationRequest: pot.toError(
          state.sendEmailValidationRequest,
          action.payload
        )
      };
    case getType(startEmailValidation.request):
      return { ...state, sendEmailValidationRequest: pot.noneLoading };
    case getType(startEmailValidation.success):
      return { ...state, sendEmailValidationRequest: pot.some(undefined) };
    default:
      return state;
  }
};

export default reducer;
