import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { walletPaymentDetailsSelector } from "../../../payment/store/selectors";

const selectWalletAnalytics = (state: GlobalState) =>
  state.features.wallet.analytics;

export const walletPaymentTentativeByRptIdSelector = createSelector(
  selectWalletAnalytics,
  state => state.paymentTentativeByRptId
);

export const walletPaymentTentativeSelector = createSelector(
  [walletPaymentTentativeByRptIdSelector, walletPaymentDetailsSelector],
  (tentativeByRptId, paymentDetailsPot) =>
    pipe(
      paymentDetailsPot,
      pot.toOption,
      O.map(({ rptId }) => tentativeByRptId[rptId]),
      O.toUndefined
    )
);
