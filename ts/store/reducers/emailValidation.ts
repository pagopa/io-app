/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  acknowledgeOnEmailValidation,
  startEmailValidation
} from "../actions/profile";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type EmailValidationState = {
  sendEmailValidationRequest: pot.Pot<void, Error>;
  acknowledgeOnEmailValidated: boolean;
};

const INITIAL_STATE: EmailValidationState = {
  sendEmailValidationRequest: pot.none,
  acknowledgeOnEmailValidated: false
};

// return the pot of email validation
export const emailValidationSelector = (
  state: GlobalState
): EmailValidationState => state.emailValidation;
// Selectors

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
    default:
      return state;
  }
};

export default reducer;

// Selectors
export const sendEmailValidationRequestSelector = (state: GlobalState) =>
  state.emailValidation.sendEmailValidationRequest;
export const acknowledgeOnEmailValidatedSelector = (state: GlobalState) =>
  state.emailValidation.acknowledgeOnEmailValidated;
