/**
 * These actions allow to handle and dispatch all those data should be kept
 * across multiple users sessions
 */

import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ActionType, createStandardAction } from "typesafe-actions";

type DifferentProfileLoggedInType = {
  isNewInstall: boolean;
};
/** Set the profile hashed fiscal code */
export const setProfileHashedFiscalCode = createStandardAction(
  "CROSS_SESSION_SET_HASHED_CF"
)<FiscalCode>();

/**
 * Inform that the current profile fiscal code is different from the previous
 * one
 */
export const differentProfileLoggedIn = createStandardAction(
  "CROSS_SESSION_DIFFERENT_PROFILE_LOGGED_ID"
)<DifferentProfileLoggedInType | void>();

export type CrossSessionsActions =
  | ActionType<typeof differentProfileLoggedIn>
  | ActionType<typeof setProfileHashedFiscalCode>;
