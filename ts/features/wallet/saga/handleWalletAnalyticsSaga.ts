import { SagaIterator } from "redux-saga";
import { all, call, select, take } from "typed-redux-saga/macro";
// We need to disable the eslint rule because the types are not available for the following imports
// eslint-disable-next-line @jambit/typed-redux-saga/use-typed-effects
import { StrictEffect } from "redux-saga/effects";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { isIdPayEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../store/reducers/types";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";

/**
 * Saga that handles the Mixpanel properties update based on the wallet screen content
 */
export function* handleWalletAnalyticsSaga() {
  const isIdPayEnabled = yield* select(isIdPayEnabledSelector);

  const bonusAndPaymentsSagas = [
    call(waitForPaymentMethods),
    call(waitForCgnDetails),
    ...(isIdPayEnabled ? [call(waitForIdPay)] : [])
  ] as unknown as Array<StrictEffect>;

  yield* all(bonusAndPaymentsSagas);

  const state: GlobalState = yield* select();

  void updateMixpanelProfileProperties(state);
  void updateMixpanelSuperProperties(state);
}

function* waitForPaymentMethods(): SagaIterator {
  yield* take([
    getPaymentsWalletUserMethods.success,
    getPaymentsWalletUserMethods.failure
  ]);
}

function* waitForIdPay(): SagaIterator {
  yield* take([idPayWalletGet.success, idPayWalletGet.failure]);
}

function* waitForCgnDetails(): SagaIterator {
  yield* take([cgnDetails.success, cgnDetails.failure]);
}
