import { ActionType, createAsyncAction } from "typesafe-actions";
import { EnableableFunctionsEnum } from "../../../../definitions/pagopa/EnableableFunctions";
import { Wallet } from "../../../types/pagopa";

export type DeleteAllByFunctionSuccess = {
  wallets: ReadonlyArray<Wallet>;
  deletedMethodsCount: number;
};

export type DeleteAllByFunctionError = {
  error: Error;
  notDeletedMethodsCount?: number;
};
/**
 * used to delete all those payment methods that have a specified function enabled
 */
export const deleteAllPaymentMethodsByFunction = createAsyncAction(
  "WALLETS_DELETE_ALL_BY_FUNCTION_REQUEST",
  "WALLETS_DELETE_ALL_BY_FUNCTION_SUCCESS",
  "WALLETS_DELETE_ALL_BY_FUNCTION_FAILURE"
)<
  EnableableFunctionsEnum,
  DeleteAllByFunctionSuccess,
  DeleteAllByFunctionError
>();

export type DeleteActions = ActionType<
  typeof deleteAllPaymentMethodsByFunction
>;
