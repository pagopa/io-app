import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { toUpper } from "lodash";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { CalculateFeeResponse } from "../../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { preferredLanguageSelector } from "../../../../../store/reducers/persistedPreferences";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { getSortedPspList } from "../../../common/utils";
import { PaymentClient } from "../../../common/api/client";
import { paymentsCalculatePaymentFeesAction } from "../../store/actions/networking";
import { selectPaymentPspAction } from "../../store/actions/orchestration";
import { walletPaymentPickedPspSelector } from "../../store/selectors";
import { getOrFetchWalletSessionToken } from "./handleWalletPaymentNewSessionToken";

export function* handleWalletPaymentCalculateFees(
  calculateFees: PaymentClient["calculateFees"],
  action: ActionType<(typeof paymentsCalculatePaymentFeesAction)["request"]>
) {
  try {
    const preferredLanguageOption = yield* select(preferredLanguageSelector);
    const language = pipe(
      preferredLanguageOption,
      O.map(toUpper),
      O.getOrElse(() => "IT")
    );

    const sessionToken = yield* getOrFetchWalletSessionToken();

    if (sessionToken === undefined) {
      yield* put(
        paymentsCalculatePaymentFeesAction.failure({
          ...getGenericError(new Error(`Missing session token`))
        })
      );
      return;
    }

    const { paymentMethodId, ...body } = { ...action.payload, language };
    const calculateFeesRequest = calculateFees({
      eCommerceSessionToken: sessionToken,
      id: paymentMethodId,
      body
    });

    const calculateFeesResult = (yield* call(
      withRefreshApiCall,
      calculateFeesRequest,
      action
    )) as SagaCallReturnType<typeof calculateFees>;

    if (E.isLeft(calculateFeesResult)) {
      yield* put(
        paymentsCalculatePaymentFeesAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(calculateFeesResult.left))
          )
        })
      );
      return;
    } else {
      const res = calculateFeesResult.right;
      if (res.status === 200) {
        const bundlesSortedByDefault = getSortedPspList(
          res.value.bundles,
          "default"
        );
        const chosenPsp = yield* select(walletPaymentPickedPspSelector);
        // If the sorted psp list has the first element marked as "onUs" and the user has not already chosen a psp, we pre-select the first element
        if (
          (bundlesSortedByDefault[0]?.onUs && O.isNone(chosenPsp)) ||
          bundlesSortedByDefault.length === 1
        ) {
          yield* put(selectPaymentPspAction(bundlesSortedByDefault[0]));
        }
        if (bundlesSortedByDefault.length === 0) {
          yield* put(
            paymentsCalculatePaymentFeesAction.failure({
              ...getGenericError(new Error(`Error: The bundles list is empty`))
            })
          );
          return;
        }
        const sortedResponse: CalculateFeeResponse = {
          ...res.value,
          bundles: res.value.bundles
        };
        yield* put(paymentsCalculatePaymentFeesAction.success(sortedResponse));
        return;
      }
      yield* put(
        paymentsCalculatePaymentFeesAction.failure({
          ...getGenericError(new Error(`Error: ${res.status}`))
        })
      );
    }
  } catch (e) {
    yield* put(
      paymentsCalculatePaymentFeesAction.failure({ ...getNetworkError(e) })
    );
  }
}
