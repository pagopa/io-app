import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { call } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { StatusEnum } from "../../../../../../../definitions/cgn/CgnActivationDetail";
import { mixpanelTrack } from "../../../../../../mixpanel";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../types/utils";
import { getError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { startTimer } from "../../../../../../utils/timer";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnActivationStatus } from "../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../store/reducers/activation";

// wait time between requests
const cgnResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

const statusProgressRecord: Record<403 | 409, CgnActivationProgressEnum> = {
  403: CgnActivationProgressEnum.INELIGIBLE,
  409: CgnActivationProgressEnum.EXISTS
};

type CgnStatusPollingSaga = ReturnType<typeof handleCgnStatusPolling>;

/**
 * Function that handles the activation of a CGN
 * Calls the activation API returning the next iteration for orchestration saga:
 * 201 -> Request created start polling with handleCgnStatusPolling saga.
 * 202 -> There's already a processing request.
 * 401 -> Bearer token null or expired.
 * 409 -> Cannot activate the user's cgn because another updateCgn request was found for this user or it is already active.
 * 403 -> Cannot activate a new CGN because the user is ineligible to get the CGN.
 * @param startCgnActivation backend client for CGN Activation API
 * @param handleCgnStatusPolling saga that handles the polling result of a CGN
 */
export const cgnActivationSaga = (
  startCgnActivation: ReturnType<typeof BackendCGN>["startCgnActivation"],
  handleCgnStatusPolling: CgnStatusPollingSaga
) =>
  function* (): Generator<
    ReduxSagaEffect,
    ActionType<typeof cgnActivationStatus>,
    any
  > {
    try {
      const startCgnActivationResult: SagaCallReturnType<
        typeof startCgnActivation
      > = yield* call(startCgnActivation, {});

      if (E.isRight(startCgnActivationResult)) {
        const status = startCgnActivationResult.right.status;
        // Status is 201 request has been created -> Start Polling
        if (status === 201) {
          return yield* call(handleCgnStatusPolling);
        }
        // 202 -> still processing
        if (status === 202) {
          return cgnActivationStatus.success({
            status: CgnActivationProgressEnum.PENDING
          });
        }
        // 409 -> Cannot activate a new cgn because another card related to this user was found.
        // 403 -> Ineligible
        else if (status === 409 || status === 403) {
          return cgnActivationStatus.success({
            status: statusProgressRecord[status]
          });
        }
        throw Error(`response status ${startCgnActivationResult.right.status}`);
      }
      // decoding failure
      throw Error(readablePrivacyReport(startCgnActivationResult.left));
    } catch (e) {
      return cgnActivationStatus.failure(getError(e));
    }
  };

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
    const startPollingTime = new Date().getTime();
    while (true) {
      const cgnActivationResult: SagaCallReturnType<typeof getCgnActivation> =
        yield* call(getCgnActivation, {});
      // blocking error -> stop polling
      if (E.isLeft(cgnActivationResult)) {
        throw cgnActivationResult.left;
      }
      // we got the result -> stop polling
      else if (
        E.isRight(cgnActivationResult) &&
        cgnActivationResult.right.status === 200
      ) {
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
      const now = new Date().getTime();
      if (now - startPollingTime >= pollingTimeThreshold) {
        return cgnActivationStatus.success({
          status: CgnActivationProgressEnum.TIMEOUT
        });
      }
    }
  };
