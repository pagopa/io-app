import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../types/utils";
import { getError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnActivationStatus } from "../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../store/reducers/activation";
import { handleCgnStatusPolling } from "./handleCgnStatusPolling";

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

      if ("right" in startCgnActivationResult) {
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
        throw new Error(
          `response status ${startCgnActivationResult.right.status}`
        );
      }
      // decoding failure
      throw new Error(readablePrivacyReport(startCgnActivationResult.left));
    } catch (e) {
      return cgnActivationStatus.failure(getError(e));
    }
  };
