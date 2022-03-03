import { put, select, take } from "typed-redux-saga/macro";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import * as pot from "italia-ts-commons/lib/pot";
import {
  fetchWalletsFailure,
  fetchWalletsRequestWithExpBackoff,
  fetchWalletsSuccess
} from "../../../../../../store/actions/wallet/wallets";
import { ActivationStatus, bpdAllData } from "../../../store/actions/details";
import {
  optInPaymentMethodsShowChoice,
  optInPaymentMethodsStart
} from "../../../store/actions/optInPaymentMethods";
import {
  activationStatusSelector,
  optInStatusSelector
} from "../../../store/reducers/details/activation";
import { CitizenOptInStatusEnum } from "../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import { ReduxSagaEffect } from "../../../../../../types/utils";
import { remoteReady, RemoteValue } from "../../../model/RemoteValue";

/**
 * This saga manage the flow that checks if a user has already take a choice about the opt-in of the payment methods.
 *
 *  The saga follows this flow::
 * - request the bpd data
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
  // Load the information about the participation of the user to the bpd program
  yield* put(bpdAllData.request());
  const bpdAllDataResponse = yield* take<
    ActionType<typeof bpdAllData.success | typeof bpdAllData.failure>
  >([getType(bpdAllData.success), getType(bpdAllData.failure)]);

  // If the bpdAllData request fail report the error
  if (isActionOf(bpdAllData.failure, bpdAllDataResponse)) {
    yield* put(
      optInPaymentMethodsShowChoice.failure(bpdAllDataResponse.payload)
    );
    return;
  }

  const activationStatus: RemoteValue<ActivationStatus, Error> = yield* select(
    activationStatusSelector
  );

  // Safety check on field returned in @link{bpdEnabled} and managed by @{enabledReducer}
  if (!remoteReady(activationStatus)) {
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

  // Load the user payment methods
  yield* put(fetchWalletsRequestWithExpBackoff());
  const fetchWalletsResultAction = yield* take<
    ActionType<typeof fetchWalletsSuccess | typeof fetchWalletsFailure>
  >([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)]);

  // If the loading work successfully starts the OptInPaymentMethods saga
  if (isActionOf(fetchWalletsSuccess, fetchWalletsResultAction)) {
    yield* put(optInPaymentMethodsShowChoice.success(true));
    yield* put(optInPaymentMethodsStart());
  } else {
    yield* put(
      optInPaymentMethodsShowChoice.failure(fetchWalletsResultAction.payload)
    );
  }
}
