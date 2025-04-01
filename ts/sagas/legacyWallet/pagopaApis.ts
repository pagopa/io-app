import { RptId, RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { Action } from "redux";
import { BackendClient } from "../../api/backend";
import { paymentVerifica } from "../../store/actions/legacyWallet";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { SagaCallReturnType } from "../../types/utils";
import { getWalletError } from "../../utils/errors";
import { readablePrivacyReport } from "../../utils/reporters";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../definitions/backend/PaymentProblemJson";
import { withRefreshApiCall } from "../../features/authentication/fastLogin/saga/utils";

export function* commonPaymentVerificationProcedure<A extends Action>(
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"],
  rptId: RptId,
  successActionProvider: (paymentData: PaymentRequestsGetResponse) => A,
  failureActionProvider: (details: Detail_v2Enum) => A,
  action?: ActionType<typeof paymentVerifica.request>
) {
  try {
    const isPagoPATestEnabled: ReturnType<typeof isPagoPATestEnabledSelector> =
      yield* select(isPagoPATestEnabledSelector);

    const request = getVerificaRpt({
      rptId: RptIdFromString.encode(rptId),
      test: isPagoPATestEnabled
    });
    const response = (yield* call(
      withRefreshApiCall,
      request,
      action as any
    )) as SagaCallReturnType<typeof getVerificaRpt>;
    if (E.isRight(response)) {
      if (response.right.status === 200) {
        // Verifica succeeded
        const paymentData = response.right.value;
        const successAction = successActionProvider(paymentData);
        yield* put(successAction);
      } else if (
        response.right.status === 500 ||
        response.right.status === 504
      ) {
        // Verifica failed with a 500 or 504, that usually means there was an error
        // interacting with pagoPA that we can interpret
        const details = response.right.value.detail_v2;
        const failureAction = failureActionProvider(details);
        yield* put(failureAction);
      } else if (response.right.status === 401) {
        // This status code does not represent an error to show to the user
        // The authentication will be handled by the Fast Login token refresh procedure
      } else {
        throw Error(`response status ${response.right.status}`);
      }
    } else {
      throw Error(readablePrivacyReport(response.left));
    }
  } catch (e) {
    // Probably a timeout
    const details = getWalletError(e);
    const failureAction = failureActionProvider(details);
    yield* put(failureAction);
  }
}
