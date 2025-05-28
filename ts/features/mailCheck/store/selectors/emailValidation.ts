import { GlobalState } from "../../../../store/reducers/types";
import { EmailValidationState } from "../reducers/emailValidation";

// return the pot of email validation

export const emailValidationSelector = (
  state: GlobalState
): EmailValidationState => state.emailValidation;
