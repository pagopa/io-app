import { SagaIterator } from "@redux-saga/core";
import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { enrollToBpd } from "../../store/actions/onboarding";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendBdpClient } from "../../api/backendBdpClient";
import { loadBdpActivationStatus } from "../../store/actions/details";

export function* exceuteAndDispatch(
  remoteCall:
    | ReturnType<typeof BackendBdpClient>["enrollCitizenIO"]
    | ReturnType<typeof BackendBdpClient>["find"],
  action: typeof enrollToBpd | typeof loadBdpActivationStatus
) {
  try {
    const enrollCitizenIOResult: SagaCallReturnType<typeof remoteCall> = yield call(
      remoteCall,
      {}
    );
    if (enrollCitizenIOResult.isRight()) {
      if (enrollCitizenIOResult.value.status === 200) {
        yield put(action.success(enrollCitizenIOResult.value.value));
        return;
      }
      throw new Error(`response status ${enrollCitizenIOResult.value.status}`);
    } else {
      throw new Error(readableReport(enrollCitizenIOResult.value));
    }
  } catch (e) {
    yield put(enrollToBpd.failure(e));
  }
}

/**
 * make a request to get the citizen status
 */
export function* findCitizen(
  findCitizen: ReturnType<typeof BackendBdpClient>["find"]
): SagaIterator {
  yield call(exceuteAndDispatch, findCitizen, loadBdpActivationStatus);
}

/**
 * make a request to enroll the citizen to the bpd
 */
export function* enrollCitizen(
  enrollCitizenIO: ReturnType<typeof BackendBdpClient>["enrollCitizenIO"]
): SagaIterator {
  yield call(exceuteAndDispatch, enrollCitizenIO, enrollToBpd);
}
