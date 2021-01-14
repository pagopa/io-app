/**
 * these actions allow to handle and dispatch all those data should be kept across multiple users sessions
 */

import { ActionType, createStandardAction } from "typesafe-actions";
import { FiscalCode } from "italia-ts-commons/lib/strings";

/**
 * set the profile hashed fiscal code
 */
export const setProfileHashedFiscalCode = createStandardAction(
  "CROSS_SESSION_SET_HASHED_CF"
)<FiscalCode>();

/**
 * remove the profile hashed fiscal code
 */
export const removeProfileHashedFiscalCode = createStandardAction(
  "CROSS_SESSION_REMOVE_HASHED_CF"
)<void>();

export type CrossSessionsActions =
  | ActionType<typeof setProfileHashedFiscalCode>
  | ActionType<typeof removeProfileHashedFiscalCode>;
