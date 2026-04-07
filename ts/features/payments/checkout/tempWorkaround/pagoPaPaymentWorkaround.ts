import {
  RptId as PagoPaRptId,
  RptIdFromString as PagoPaRptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Dispatch } from "redux";

import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { NavigationParams } from "../../../../navigation/NavigationService";
import { AppParamsList } from "../../../../navigation/params/AppParamsList";
import { Action } from "../../../../store/actions/types";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  initPaymentStateAction,
  PaymentInitStateParams
} from "../store/actions/orchestration";

type PagoPaPaymentParams = Omit<PaymentInitStateParams, "startRoute">;

/**
 * This is a temporary workaround
 * [IOCOM-1558](https://pagopa.atlassian.net/browse/IOCOM-1558)
 */
export const startPaymentFlowWithRptIdWorkaround = (
  rptId: PagoPaRptId,
  dispatch: Dispatch<Action>,
  navigate: <T extends keyof AppParamsList>(
    ...args: NavigationParams<T>
  ) => void,
  params: PagoPaPaymentParams = {}
) => {
  pipe(
    O.fromNullable(rptId),
    O.map(PagoPaRptIdFromString.encode),
    O.map(RptId.decode),
    O.chain(O.fromEither),
    O.map(rptIdString =>
      startPaymentFlowWorkaround(rptIdString, dispatch, navigate, params)
    )
  );
};

/**
 * This is a temporary workaround
 * [IOCOM-1558](https://pagopa.atlassian.net/browse/IOCOM-1558)
 */
const initPaymentStateWorkaround = (
  params: PagoPaPaymentParams,
  dispatch: Dispatch<Action>
) => {
  dispatch(initPaymentStateAction(params));
};

/**
 * This is a temporary workaround
 * [IOCOM-1558](https://pagopa.atlassian.net/browse/IOCOM-1558)
 */
const startPaymentFlowWorkaround = (
  rptId: RptId,
  dispatch: Dispatch<Action>,
  navigate: <T extends keyof AppParamsList>(
    ...args: NavigationParams<T>
  ) => void,
  params: PagoPaPaymentParams
) => {
  initPaymentStateWorkaround(params, dispatch);
  navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
    screen: PaymentsCheckoutRoutes.PAYMENT_NOTICE_SUMMARY,
    params: {
      rptId
    }
  });
};
