import { SagaIterator } from "@redux-saga/core";
import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { enrollToBpd } from "../../store/actions/onboarding";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { loadBpdActivationStatus } from "../../store/actions/details";

export function* executeAndDispatch(
  remoteCall:
    | ReturnType<typeof BackendBpdClient>["enrollCitizenIO"]
    | ReturnType<typeof BackendBpdClient>["find"],
  action: typeof enrollToBpd | typeof loadBpdActivationStatus
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
export function* getCitizen(
  findCitizen: ReturnType<typeof BackendBpdClient>["find"]
): SagaIterator {
  yield call(executeAndDispatch, findCitizen, loadBpdActivationStatus);
}

/**
 * make a request to enroll the citizen to the bpd
 */
export function* putEnrollCitizen(
  enrollCitizenIO: ReturnType<typeof BackendBpdClient>["enrollCitizenIO"]
): SagaIterator {
  yield call(executeAndDispatch, enrollCitizenIO, enrollToBpd);
}
