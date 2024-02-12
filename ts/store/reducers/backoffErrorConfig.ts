import { getType } from "typesafe-actions";
import _ from "lodash";
import { PayloadAC } from "typesafe-actions/dist/type-helpers";
import {
  fetchTransactionsFailure,
  fetchTransactionsSuccess
} from "../actions/wallet/transactions";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardSuccess,
  fetchWalletsFailure,
  fetchWalletsSuccess
} from "../actions/wallet/wallets";
import { euCovidCertificateGet } from "../../features/euCovidCert/store/actions";

/**
 * list of monitored actions
 * each entry is a tuple of 2
 * 0 - the failure action that is considered to create/increment the backoff delay
 * 1 - the success action that is considered to delete the previous backoff delay
 */
const monitoredActions: ReadonlyArray<
  [failureAction: PayloadAC<any, any>, successAction: PayloadAC<any, any>]
> = [
  [addWalletCreditCardFailure, addWalletCreditCardSuccess],
  [fetchTransactionsFailure, fetchTransactionsSuccess],
  [fetchWalletsFailure, fetchWalletsSuccess],
  [euCovidCertificateGet.failure, euCovidCertificateGet.success]
];

const failureActions = monitoredActions.map(ma => ma[0]);
const successActions = monitoredActions.map(ma => ma[1]);

export const failureActionTypes = () => failureActions.map(getType);
export const successActionTypes = () => successActions.map(getType);
export type FailureActions = (typeof failureActions)[number];

export const backoffConfig = () => ({
  maxAttempts: 4,
  base: 2,
  mul: 1000
});
