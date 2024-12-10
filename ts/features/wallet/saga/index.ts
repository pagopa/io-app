import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import {
  all,
  call,
  put,
  select,
  take,
  takeLatest,
  takeLeading
} from "typed-redux-saga/macro";
// We need to disable the eslint rule because the types are not available for the following imports
// eslint-disable-next-line @jambit/typed-redux-saga/use-typed-effects
import { StrictEffect } from "redux-saga/effects";
import { walletAddCards } from "../store/actions/cards";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import {
  selectWalletCards,
  selectWalletPlaceholders
} from "../store/selectors";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { GlobalState } from "../../../store/reducers/types";
import { isIdPayEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { handleWalletPlaceholdersTimeout } from "./handleWalletLoadingPlaceholdersTimeout";
import { handleWalletLoadingStateSaga } from "./handleWalletLoadingStateSaga";

const LOADING_STATE_TIMEOUT = 2000 as Millisecond;

export function* watchWalletSaga(): SagaIterator {
  // Adds persisted placeholders as cards in the wallet
  const currentCards = yield* select(selectWalletCards);
  if (currentCards.length === 0) {
    const placeholders = yield* select(selectWalletPlaceholders);
    yield* put(walletAddCards(placeholders));
  }

  yield* takeLatest(
    walletToggleLoadingState,
    handleWalletLoadingStateSaga,
    LOADING_STATE_TIMEOUT
  );
  yield* takeLeading(
    walletToggleLoadingState,
    handleWalletPlaceholdersTimeout,
    LOADING_STATE_TIMEOUT
  );

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
