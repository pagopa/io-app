import { call, Effect } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendCGN } from "../../api/backendCgn";
import { cgnActivationStatus } from "../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../store/reducers/activation";
import { startTimer } from "../../../../../utils/timer";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { CgnActivatedStatus } from "../../../../../../definitions/cgn/CgnActivatedStatus";

// wait time between requests
const cgnResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

const statusProgressRecord: Record<403 | 409, CgnActivationProgressEnum> = {
  403: CgnActivationProgressEnum.INELIGIBLE,
  409: CgnActivationProgressEnum.EXISTS
};

export type CgnStatusPollingSaga = ReturnType<typeof handleCgnStatusPolling>;

export const cgnActivationSaga = (
  startCgnActivation: ReturnType<typeof BackendCGN>["startCgnActivation"],
  handleCgnStatusPolling: CgnStatusPollingSaga
) =>
  function* (): Generator<Effect, ActionType<typeof cgnActivationStatus>, any> {
    try {
      const startCgnActivationResult: SagaCallReturnType<typeof startCgnActivation> = yield call(
        startCgnActivation,
        {}
      );

      if (startCgnActivationResult.isRight()) {
        const status = startCgnActivationResult.value.status;
        // Status is 201 request has been created -> Start Polling
        if (status === 201) {
          return yield call(handleCgnStatusPolling);
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
        throw Error(`response status ${startCgnActivationResult.value.status}`);
      }
      // decoding failure
      throw Error(readablePrivacyReport(startCgnActivationResult.value));
    } catch (e) {
      return cgnActivationStatus.failure(e);
    }
  };

export const handleCgnStatusPolling = (
  getCgnStatus: ReturnType<typeof BackendCGN>["getCgnStatus"]
) =>
  function* (): Generator<Effect, ActionType<typeof cgnActivationStatus>, any> {
    const startPollingTime = new Date().getTime();
    while (true) {
      const cgnStatusResult: SagaCallReturnType<typeof getCgnStatus> = yield call(
        getCgnStatus,
        {}
      );
      // blocking error -> stop polling
      if (cgnStatusResult.isLeft()) {
        throw cgnStatusResult.value;
      }
      // we got the result -> stop polling
      else if (
        cgnStatusResult.isRight() &&
        CgnActivatedStatus.is(cgnStatusResult.value.value)
      ) {
        return cgnActivationStatus.success({
          status: CgnActivationProgressEnum.SUCCESS,
          activation: cgnStatusResult.value.value
        });
      }
      // sleep
      yield call(startTimer, cgnResultPolling);
      // check if the time threshold was exceeded, if yes stop polling
      const now = new Date().getTime();
      if (now - startPollingTime >= pollingTimeThreshold) {
        return cgnActivationStatus.success({
          status: CgnActivationProgressEnum.TIMEOUT
        });
      }
    }
  };
