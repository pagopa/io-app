import { StatusEnum } from "@io-app/api-types/generated/definitions/cgn/CgnActivationDetail";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { call } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import { mixpanelTrack } from "../../../../../../mixpanel";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../types/utils";
import { startTimer } from "../../../../../../utils/timer";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnActivationStatus } from "../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../store/reducers/activation";

// wait time between requests
const cgnResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

/**
 * Function that handles the polling check of the CGN's status
 * Calls the status API with a polling interrupted only if it's activated or if a network error has been raised
 * @param getCgnActivation backend client to know the current user CGN status
 */
export const handleCgnStatusPolling = (
  getCgnActivation: ReturnType<typeof BackendCGN>["getCgnActivation"]
) =>
  function* (): Generator<
    ReduxSagaEffect,
    ActionType<typeof cgnActivationStatus>,
    any
  > {
    const startPollingTime = Date.now();
    while (true) {
      const cgnActivationResult: SagaCallReturnType<typeof getCgnActivation> =
        yield* call(getCgnActivation, {});
      // blocking error -> stop polling
      if ("left" in cgnActivationResult) {
        throw cgnActivationResult.left;
      }
      // we got the result -> stop polling
      else if (cgnActivationResult.right.status === 200) {
        switch (cgnActivationResult.right.value.status) {
          case StatusEnum.COMPLETED:
            return cgnActivationStatus.success({
              status: CgnActivationProgressEnum.SUCCESS,
              activation: cgnActivationResult.right.value
            });
          case StatusEnum.ERROR:
            throw Error(
              `CGN Activation status ${cgnActivationResult.right.value.status}`
            );
          // activation is still pending skip
          case StatusEnum.PENDING:
            break;
          default:
            mixpanelTrack(getType(cgnActivationStatus.failure), {
              reason: `unexpected status result ${cgnActivationResult.right.value.status}`
            });
            break;
        }
      }
      // sleep
      yield* call(startTimer, cgnResultPolling);
      // check if the time threshold was exceeded, if yes stop polling
      const now = Date.now();
      if (now - startPollingTime >= pollingTimeThreshold) {
        return cgnActivationStatus.success({
          status: CgnActivationProgressEnum.TIMEOUT
        });
      }
    }
  };
