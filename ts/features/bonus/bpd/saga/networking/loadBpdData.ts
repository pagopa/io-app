import { call, delay, put, select, take } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getBackoffTime } from "../../../../../utils/backoffError";
import { isTestEnv } from "../../../../../utils/environment";
import { loadAbi } from "../../../../wallet/onboarding/bancomat/store/actions";
import { abiSelector } from "../../../../wallet/onboarding/store/abi";
import { isReady } from "../../model/RemoteValue";
import {
  bpdAllData,
  bpdLoadActivationStatus
} from "../../store/actions/details";
import { bpdPeriodsAmountLoad } from "../../store/actions/periods";

/**
 * retrieve possible backoff waiting time and if there is, wait that time
 */
function* checkPreviousFailures() {
  // wait if some previous errors occurred
  const loadActivationBackOff: SagaCallReturnType<typeof getBackoffTime> =
    yield* call(getBackoffTime, bpdLoadActivationStatus.failure);
  const loadPeriodsBackOff: SagaCallReturnType<typeof getBackoffTime> =
    yield* call(getBackoffTime, bpdPeriodsAmountLoad.failure);
  const waitingTime = Math.max(loadActivationBackOff, loadPeriodsBackOff);
  if (waitingTime > 0) {
    yield* delay(waitingTime);
  }
}

/**
 * Load all the BPD details data:
 * - Activation Status
 * - Abi list
 * - Periods
 * - Amount foreach period !== "Inactive"
 * - Transactions foreach period !== "Inactive"
 */
export function* loadBpdData() {
  // TODO: move from here
  const abiList: ReturnType<typeof abiSelector> = yield* select(abiSelector);

  // The volatility of the bank list is extremely low.
  // There is no need to refresh it every time.
  // A further refinement could be to insert an expiring cache
  if (!isReady(abiList)) {
    yield* put(loadAbi.request());
  }
  yield* call(checkPreviousFailures);
  // First request the bpd activation status
  yield* put(bpdLoadActivationStatus.request());

  const activationStatus = yield* take<
    ActionType<
      | typeof bpdLoadActivationStatus.success
      | typeof bpdLoadActivationStatus.failure
    >
  >([bpdLoadActivationStatus.success, bpdLoadActivationStatus.failure]);

  if (activationStatus.type === getType(bpdLoadActivationStatus.success)) {
    // if the user is not registered with bpd,
    // there is no need to request other data as it is never allowed to view closed periods
    if (!activationStatus.payload.enabled) {
      yield* put(bpdAllData.success());
      return;
    }

    // In case of success, request the periods, amounts and ranking foreach required period
    yield* put(bpdPeriodsAmountLoad.request());

    const periods = yield* take<
      ActionType<
        | typeof bpdPeriodsAmountLoad.success
        | typeof bpdPeriodsAmountLoad.failure
      >
    >([bpdPeriodsAmountLoad.success, bpdPeriodsAmountLoad.failure]);

    if (periods.type === getType(bpdPeriodsAmountLoad.success)) {
      // The load of all the required data for bpd is now completed with success
      yield* put(bpdAllData.success());
    } else {
      // The load of all the required bpd data is failed
      yield* put(bpdAllData.failure(periods.payload));
    }
  } else {
    // The load of all the required bpd data is failed
    yield* put(bpdAllData.failure(activationStatus.payload));
  }
}

// to keep solid code encapsulation
export const testableFunctions = {
  checkPreviousFailures: isTestEnv ? checkPreviousFailures : undefined
};
