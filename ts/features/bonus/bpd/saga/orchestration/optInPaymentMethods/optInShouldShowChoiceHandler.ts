import * as pot from "@pagopa/ts-commons/lib/pot";
import { put, select, take } from "typed-redux-saga/macro";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import { CitizenOptInStatusEnum } from "../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import {
  fetchWalletsFailure,
  fetchWalletsRequestWithExpBackoff,
  fetchWalletsSuccess
} from "../../../../../../store/actions/wallet/wallets";
import {
  getBPDMethodsVisibleInWalletSelector,
  pagoPaCreditCardWalletV1Selector
} from "../../../../../../store/reducers/wallet/wallets";
import { ReduxSagaEffect } from "../../../../../../types/utils";
import { isLoading, isReady, RemoteValue } from "../../../model/RemoteValue";
import {
  ActivationStatus,
  bpdLoadActivationStatus
} from "../../../store/actions/details";
import { optInPaymentMethodsShowChoice } from "../../../store/actions/optInPaymentMethods";
import {
  activationStatusSelector,
  optInStatusSelector
} from "../../../store/reducers/details/activation";

/**
 * This saga manage the flow that checks if a user has already take a choice about the opt-in of the payment methods.
 *
 *  The saga follows this flow:
 * - check if the user participate or not in the cashback program
 * - check if the user has already taken the opt-in payment methods choice
 * - request the user's payment methods
 * - check if the loading of the payment method succeed
 * - if succeed start the saga
 */
export function* optInShouldShowChoiceHandler(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  const bpdActivationInitialStatus: RemoteValue<ActivationStatus, Error> =
    yield* select(activationStatusSelector);

  // Check is needed to avoid to spawn multiple request if the status
  // is already loading
  if (!isLoading(bpdActivationInitialStatus)) {
    // Load the information about the participation of the user to the bpd program
    yield* put(bpdLoadActivationStatus.request());
  }
  const bpdLoadActivationStatusResponse = yield* take<
    ActionType<
      | typeof bpdLoadActivationStatus.success
      | typeof bpdLoadActivationStatus.failure
    >
  >([
    getType(bpdLoadActivationStatus.success),
    getType(bpdLoadActivationStatus.failure)
  ]);

  // If the bpdAllData request fail report the error
  if (
    isActionOf(bpdLoadActivationStatus.failure, bpdLoadActivationStatusResponse)
  ) {
    yield* put(
      optInPaymentMethodsShowChoice.failure(
        bpdLoadActivationStatusResponse.payload
      )
    );
    return;
  }

  const activationStatus: RemoteValue<ActivationStatus, Error> = yield* select(
    activationStatusSelector
  );

  // Safety check on field returned in @link{activationStatus} and managed by @{activationStatusReducer}
  if (!isReady(activationStatus)) {
    yield* put(
      optInPaymentMethodsShowChoice.failure(
        new Error("The bpdEnabled value is not potSome")
      )
    );
    return;
  }

  // If the user is never been enrolled in the bpd program returns with value false
  if (activationStatus.kind === "ready" && activationStatus.value === "never") {
    yield* put(optInPaymentMethodsShowChoice.success(false));
    return;
  }

  const optInStatus: pot.Pot<CitizenOptInStatusEnum, Error> = yield* select(
    optInStatusSelector
  );

  // Safety check on field returned in @link{optInStatus} and managed by @{optInStatusReducer}
  if (optInStatus.kind !== "PotSome") {
    yield* put(
      optInPaymentMethodsShowChoice.failure(
        new Error("The optInStatus value is not potSome")
      )
    );
    return;
  }

  // If the user already take a choice returns with value false
  if (optInStatus.value !== CitizenOptInStatusEnum.NOREQ) {
    yield* put(optInPaymentMethodsShowChoice.success(false));
    return;
  }

  // Check if wallets are already loaded
  // this check is needed becaus the exponential backoff would raise an error cause of the spawning of multiple requests
  const potWallets = yield* select(pagoPaCreditCardWalletV1Selector);

  if (!pot.isLoading(potWallets)) {
    // Load the user payment methods
    yield* put(fetchWalletsRequestWithExpBackoff());
  }
  const fetchWalletsResultAction = yield* take<
    ActionType<typeof fetchWalletsSuccess | typeof fetchWalletsFailure>
  >([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)]);

  // If the loading work successfully starts the OptInPaymentMethods saga
  if (isActionOf(fetchWalletsSuccess, fetchWalletsResultAction)) {
    const bpdPaymentMethods = yield* select(
      getBPDMethodsVisibleInWalletSelector
    );

    if (bpdPaymentMethods.length > 0) {
      yield* put(optInPaymentMethodsShowChoice.success(true));
      return;
    }
    yield* put(optInPaymentMethodsShowChoice.success(false));
  } else {
    yield* put(
      optInPaymentMethodsShowChoice.failure(fetchWalletsResultAction.payload)
    );
  }
}
