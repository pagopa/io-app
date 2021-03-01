import { call, Effect, put } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { Millisecond } from "italia-ts-commons/lib/units";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import { BackendCGN } from "../../../../api/backendCgn";
import { startTimer } from "../../../../../../../utils/timer";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
import { getError } from "../../../../../../../utils/errors";
import { mixpanelTrack } from "../../../../../../../mixpanel";
import { StatusEnum } from "../../../../../../../../definitions/cgn/EycaActivationDetail";
import { CgnEycaActivationProgressEnum } from "../../../../store/reducers/eyca/activation";
import { cgnEycaActivationStatus } from "../../../../store/actions/eyca/activation";
import { cgnEycaDetails } from "../../../../store/actions/eyca/details";
import { StatusEnum as CardPendingStatus } from "../../../../../../../../definitions/cgn/CardPending";

// wait time between requests
const cgnResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

const statusProgressRecord: Record<403 | 409, CgnEycaActivationProgressEnum> = {
  403: CgnEycaActivationProgressEnum.INELIGIBLE,
  409: CgnEycaActivationProgressEnum.EXISTS
};

export type EycaStatusPollingSaga = ReturnType<typeof handleEycaStatusPolling>;

/**
 * Function that handles the activation of a EYCA Card
 * Calls the activation API returning the next iteration for orchestration saga:
 * 201 -> Request created start polling with handleEycaStatusPolling saga.
 * 202 -> There's already a processing request -> EycaDetails is in PENDING STATE
 * 401 -> Bearer token null or expired -> EycaDetails is in INELIGIBLE STATE
 * 409 -> Cannot activate the user's cgn because another updateCgn request was found for this user or it is already active
 * 403 -> Cannot activate a new EYCA because the user is ineligible to get the CGN -> EycaDetails is in INELIGIBLE STATE
 * @param startEycaActivation backend client for CGN Activation API
 * @param handleEycaStatusPolling saga that handles the polling result of a EYCA Activation
 */
export const eycaActivationSaga = (
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"],
  handleEycaStatusPolling: EycaStatusPollingSaga
) =>
  function* (): Generator<
    Effect,
    ActionType<typeof cgnEycaActivationStatus>,
    any
  > {
    try {
      const startEycaActivationResult: SagaCallReturnType<typeof startEycaActivation> = yield call(
        startEycaActivation,
        {}
      );

      if (startEycaActivationResult.isRight()) {
        const status = startEycaActivationResult.value.status;
        // Status is 201 request has been created -> Start Polling
        if (status === 201) {
          return yield call(handleEycaStatusPolling);
        }
        // 202 -> still processing
        if (status === 202) {
          yield put(
            cgnEycaDetails.success({
              status: "ELIGIBLE",
              information: { status: CardPendingStatus.PENDING }
            })
          );
          return cgnEycaActivationStatus.success({
            status: CgnEycaActivationProgressEnum.PENDING
          });
        }
        // 409 -> Cannot activate a new cgn because another card related to this user was found.
        // 403 -> Ineligible
        else if (status === 409 || status === 403) {
          yield put(
            cgnEycaDetails.success(
              status === 403
                ? { status: "INELIGIBLE" }
                : {
                    status: "ELIGIBLE",
                    information: { status: CardPendingStatus.PENDING }
                  }
            )
          );
          return cgnEycaActivationStatus.success({
            status: statusProgressRecord[status]
          });
        }
        throw Error(
          `response status ${startEycaActivationResult.value.status}`
        );
      }
      // decoding failure
      throw Error(readablePrivacyReport(startEycaActivationResult.value));
    } catch (e) {
      return cgnEycaActivationStatus.failure(getError(e));
    }
  };

/**
 * Function that handles the polling check of the EYCA's status
 * Calls the status API with a polling interrupted only if it's activated or if a network error has been raised
 * @param getEycaActivation backend client to know the current user CGN status
 */
export const handleEycaStatusPolling = (
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
) =>
  function* (): Generator<
    Effect,
    ActionType<typeof cgnEycaActivationStatus>,
    any
  > {
    const startPollingTime = new Date().getTime();
    while (true) {
      const eycaActivationResult: SagaCallReturnType<typeof getEycaActivation> = yield call(
        getEycaActivation,
        {}
      );
      // blocking error -> stop polling
      if (eycaActivationResult.isLeft()) {
        throw eycaActivationResult.value;
      }
      // we got the result -> stop polling
      else if (
        eycaActivationResult.isRight() &&
        eycaActivationResult.value.status === 200
      ) {
        switch (eycaActivationResult.value.value.status) {
          case StatusEnum.COMPLETED:
            // Activation Completed Retrieve the Eyca details
            yield put(cgnEycaDetails.request());
            return cgnEycaActivationStatus.success({
              status: CgnEycaActivationProgressEnum.SUCCESS,
              value: eycaActivationResult.value.value
            });
          case StatusEnum.ERROR:
            yield put(
              cgnEycaDetails.success({
                status: "ELIGIBLE"
              })
            );
            throw Error(
              `Eyca Activation status ${eycaActivationResult.value.value.status}`
            );
            break;
          // activation is still pending skip
          case StatusEnum.PENDING:
          case StatusEnum.RUNNING:
            break;
          default:
            void mixpanelTrack(getType(cgnEycaActivationStatus.failure), {
              reason: `unexpected status result ${eycaActivationResult.value.value.status}`
            });
            break;
        }
      }
      // sleep
      yield call(startTimer, cgnResultPolling);
      // check if the time threshold was exceeded, if yes stop polling
      const now = new Date().getTime();
      if (now - startPollingTime >= pollingTimeThreshold) {
        yield put(
          cgnEycaDetails.success({
            status: "ELIGIBLE",
            information: { status: CardPendingStatus.PENDING }
          })
        );
        return cgnEycaActivationStatus.success({
          status: CgnEycaActivationProgressEnum.TIMEOUT
        });
      }
    }
  };
