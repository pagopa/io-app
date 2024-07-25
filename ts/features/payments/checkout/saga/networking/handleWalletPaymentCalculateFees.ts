import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { toUpper } from "lodash";
import { put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { preferredLanguageSelector } from "../../../../../store/reducers/persistedPreferences";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { PaymentClient } from "../../../common/api/client";
import { paymentsCalculatePaymentFeesAction } from "../../store/actions/networking";
import { withPaymentsSessionToken } from "../../../common/utils/withPaymentsSessionToken";

export function* handleWalletPaymentCalculateFees(
  calculateFees: PaymentClient["calculateFeesForIO"],
  action: ActionType<(typeof paymentsCalculatePaymentFeesAction)["request"]>
) {
  try {
    const preferredLanguageOption = yield* select(preferredLanguageSelector);
    const language = pipe(
      preferredLanguageOption,
      O.map(toUpper),
      O.getOrElse(() => "IT")
    );

    const { paymentMethodId, idPsp, ...body } = { ...action.payload, language };
    const calculateFeesResult = yield* withPaymentsSessionToken(
      calculateFees,
      paymentsCalculatePaymentFeesAction.failure,
      action,
      {
        id: paymentMethodId,
        body: {
          ...body,
          idPspList: idPsp ? [idPsp] : body.idPspList
        }
      },
      "pagoPAPlatformSessionToken"
    );

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
        if (res.value.bundles.length === 0) {
          yield* put(
            paymentsCalculatePaymentFeesAction.failure(
              getGenericError(new Error(`Error: The bundles list is empty`))
            )
          );
          return;
        }
        yield* put(paymentsCalculatePaymentFeesAction.success(res.value));
        return;
      } else if (res.status !== 401) {
        yield* put(
          paymentsCalculatePaymentFeesAction.failure(
            getGenericError(new Error(`Error: ${res.status}`))
          )
        );
      }
    }
  } catch (e) {
    yield* put(
      paymentsCalculatePaymentFeesAction.failure({ ...getNetworkError(e) })
    );
  }
}
