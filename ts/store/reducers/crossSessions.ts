/**
 * this state / reducer represents and handles all those data should be kept across multiple users sessions
 */
import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { fromNullable } from "fp-ts/lib/Option";
import sha from "sha.js";
import { Action } from "../actions/types";
import {
  differentProfileLoggedIn,
  sameProfileLoggedIn,
  setProfileHashedFiscalCode
} from "../actions/crossSessions";
import { GlobalState } from "./types";

type HashedFiscalCode = NonEmptyString | undefined;
export enum CrossSessionProfileIdentity {
  Unknown = "UNKNOWN",
  SameIdentity = "SAME_IDENTITY",
  DifferentIdentity = "DIFFERENT_IDENTITY"
}

export type CrossSessionsState = {
  hashedFiscalCode: HashedFiscalCode;
  isDifferentProfile: CrossSessionProfileIdentity;
};

const INITIAL_STATE: CrossSessionsState = {
  hashedFiscalCode: undefined,
  isDifferentProfile: CrossSessionProfileIdentity.Unknown
};

const hash = (value: FiscalCode): NonEmptyString =>
  sha("sha256").update(value).digest("hex") as NonEmptyString;

const reducer = (
  state: CrossSessionsState = INITIAL_STATE,
  action: Action
): CrossSessionsState => {
  switch (action.type) {
    case getType(setProfileHashedFiscalCode):
      return {
        ...state,
        hashedFiscalCode: hash(action.payload)
      };
    case getType(differentProfileLoggedIn):
      return {
        ...state,
        isDifferentProfile: CrossSessionProfileIdentity.DifferentIdentity
      };
    case getType(sameProfileLoggedIn):
      return {
        ...state,
        isDifferentProfile: CrossSessionProfileIdentity.SameIdentity
      };
    default:
      return state;
  }
};

// return the stored hashed fiscal code
export const hashedProfileFiscalCodeSelector = (
  state: GlobalState
): HashedFiscalCode => state.crossSessions.hashedFiscalCode;

/**
 * Returns a value describing equality or difference between
 * the persisted hashed fiscal code and the input argument.
 *
 * @returns
 *  1. Unknown: Could be a fresh app install where no fiscal code is persisted
 *  2. SameIdentity: The fiscal codes are a match
 *  3. DifferentIdentity: The fiscal codes do not match, it is a different account
 */
export const isDifferentFiscalCodeSelector = (
  state: GlobalState,
  fiscalCode: FiscalCode
) =>
  createSelector(
    hashedProfileFiscalCodeSelector,
    (hashedProfile: HashedFiscalCode): CrossSessionProfileIdentity =>
      fromNullable(hashedProfile)
        .map<CrossSessionProfileIdentity>(hp =>
          hp !== hash(fiscalCode)
            ? CrossSessionProfileIdentity.DifferentIdentity
            : CrossSessionProfileIdentity.SameIdentity
        )
        .getOrElse(CrossSessionProfileIdentity.Unknown)
  )(state);

export const isDifferentProfileSelector = (
  state: GlobalState
): CrossSessionProfileIdentity => state.crossSessions.isDifferentProfile;

export default reducer;
