/**
 * this state / reducer represents and handles all those data should be kept across multiple users sessions
 */
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { isActionOf } from "typesafe-actions";
import { createSelector } from "reselect";
import * as O from "fp-ts/lib/Option";
import sha from "sha.js";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../actions/types";
import { setProfileHashedFiscalCode } from "../actions/crossSessions";
import { GlobalState } from "./types";

type HashedFiscalCode = NonEmptyString | undefined;
export type CrossSessionsState = {
  hashedFiscalCode: HashedFiscalCode;
};

const INITIAL_STATE: CrossSessionsState = {
  hashedFiscalCode: undefined
};

const hash = (value: FiscalCode): NonEmptyString =>
  sha("sha256").update(value).digest("hex") as NonEmptyString;

const reducer = (
  state: CrossSessionsState = INITIAL_STATE,
  action: Action
): CrossSessionsState => {
  if (isActionOf(setProfileHashedFiscalCode, action)) {
    return {
      ...state,
      hashedFiscalCode: hash(action.payload)
    };
  }
  return state;
};

// return the stored hashed fiscal code
export const hashedProfileFiscalCodeSelector = (
  state: GlobalState
): HashedFiscalCode => state.crossSessions.hashedFiscalCode;

/**
 * return true if the given fiscal code is different from the hashed stored one, false otherwise
 * if there is no stored hashed fiscal code it returns undefined (cant say if they are different)
 */
export const isDifferentFiscalCodeSelector = (
  state: GlobalState,
  fiscalCode: FiscalCode
) =>
  createSelector(
    hashedProfileFiscalCodeSelector,
    (hashedProfile: HashedFiscalCode): boolean | undefined =>
      pipe(
        hashedProfile,
        O.fromNullable,
        O.map(hp => hp !== hash(fiscalCode)),
        O.toUndefined
      )
  )(state);

export default reducer;
