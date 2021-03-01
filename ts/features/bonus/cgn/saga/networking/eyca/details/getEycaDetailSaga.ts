import { call, Effect, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { ActionType } from "typesafe-actions";
import { BackendCGN } from "../../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import { getNetworkError } from "../../../../../../../utils/errors";
import { cgnEycaDetails } from "../../../../store/actions/eyca/details";
import { CardPending } from "../../../../../../../../definitions/cgn/CardPending";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
import { EycaCard } from "../../../../../../../../definitions/cgn/EycaCard";

/**
 * Saga to retrieve the actual status of EYCA Details and status:
 * We have a mixture of cases based on EYCA status and API response status:
 * - 200 -> we check if the card is PENDING and check the actual status of the activation process if it's in ERROR
 *          status we should show the Eyca Error component
 * - 409/404 -> The user is ELIGIBLE for an EYCA Card but no information is available, should ask again for EYCA Activation
 * - Others -> User is not ELIGIBLE for an Eyca card we, won't show any information in the screen
 * @param getEycaStatus
 * @param getEycaActivation
 */
export function* eycaGetInformationSaga(
  getEycaStatus: ReturnType<typeof BackendCGN>["getEycaStatus"],
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
) {
  try {
    const eycaInformationResult: SagaCallReturnType<typeof getEycaStatus> = yield call(
      getEycaStatus,
      {}
    );
    if (eycaInformationResult.isLeft()) {
      yield put(
        cgnEycaDetails.failure({
          kind: "generic",
          value: new Error(readableReport(eycaInformationResult.value))
        })
      );
    } else if (eycaInformationResult.isRight()) {
      switch (eycaInformationResult.value.status) {
        case 200:
          if (CardPending.is(eycaInformationResult.value.value)) {
            const action = yield call(
              getEycaActivationStatus(
                getEycaActivation,
                eycaInformationResult.value.value
              )
            );
            yield put(action);
          } else {
            yield put(
              cgnEycaDetails.success({
                status: "ELIGIBLE",
                information: eycaInformationResult.value.value
              })
            );
          }
          break;
        case 409:
        case 404:
          yield put(
            cgnEycaDetails.success({
              status: "ELIGIBLE"
            })
          );
          break;
        default:
          yield put(
            cgnEycaDetails.failure({
              kind: "generic",
              value: new Error(
                `response status ${eycaInformationResult.value.status}`
              )
            })
          );
      }
    }
  } catch (e) {
    yield put(cgnEycaDetails.failure(getNetworkError(e)));
  }
}

// Get the EYCA activation status from the the Backend Orchestrator
export const getEycaActivationStatus = (
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"],
  card: EycaCard
) =>
  function* (): Generator<Effect, ActionType<typeof cgnEycaDetails>, any> {
    try {
      const getEycaActivationResult: SagaCallReturnType<typeof getEycaActivation> = yield call(
        getEycaActivation,
        {}
      );

      if (getEycaActivationResult.isRight()) {
        if (getEycaActivationResult.value.status === 200) {
          if (getEycaActivationResult.value.value.status === "ERROR") {
            return cgnEycaDetails.success({
              status: "ELIGIBLE"
            });
          }
          return cgnEycaDetails.success({
            status: "ELIGIBLE",
            information: card
          });
        }
        throw Error(`response status ${getEycaActivationResult.value.status}`);
      }
      // decoding failure
      throw Error(readablePrivacyReport(getEycaActivationResult.value));
    } catch (e) {
      return cgnEycaDetails.failure(getNetworkError(e));
    }
  };
