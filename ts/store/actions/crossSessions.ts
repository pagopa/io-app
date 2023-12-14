/**
 * these actions allow to handle and dispatch all those data should be kept across multiple users sessions
 */

import { ActionType, createStandardAction } from "typesafe-actions";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";

type DifferentProfileLoggedInType = {
  isNewInstall: boolean;
};
/**
 * set the profile hashed fiscal code
 */
export const setProfileHashedFiscalCode = createStandardAction(
  "CROSS_SESSION_SET_HASHED_CF"
)<FiscalCode>();

/**
 * inform that the current profile fiscal code is different from the previous one
 */
export const differentProfileLoggedIn = createStandardAction(
  "CROSS_SESSION_DIFFERENT_PROFILE_LOGGED_ID"
)<DifferentProfileLoggedInType | void>();

export type CrossSessionsActions =
  | ActionType<typeof setProfileHashedFiscalCode>
  | ActionType<typeof differentProfileLoggedIn>;
