/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { startEmailValidation } from "../actions/profile";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type EmailValidationState = {
  sendEmailValidationRequest: pot.Pot<void, Error>;
};

const INITIAL_STATE: EmailValidationState = {
  sendEmailValidationRequest: pot.none
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
    default:
      return state;
  }
};

export default reducer;

// Selectors
export const sendEmailValidationRequestSelector = (state: GlobalState) =>
  state.emailValidation.sendEmailValidationRequest;
