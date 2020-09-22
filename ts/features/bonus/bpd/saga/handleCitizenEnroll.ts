import { SagaIterator } from "@redux-saga/core";
import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BackendBdpClient } from "../api/backendBdpClient";
import { SagaCallReturnType } from "../../../../types/utils";
import { enrollToBpd } from "../store/actions/onboarding";

/**
 * make a request to enroll the citizen to the bpd
 */
export function* handleEnrollCitizen(
  enrollCitizenIO: ReturnType<typeof BackendBdpClient>["enrollCitizenIO"]
): SagaIterator {
  try {
    const enrollCitizenIOResult: SagaCallReturnType<typeof enrollCitizenIO> = yield call(
      enrollCitizenIO,
      {}
    );
    if (enrollCitizenIOResult.isRight()) {
      if (enrollCitizenIOResult.value.status === 200) {
        yield put(enrollToBpd.success(enrollCitizenIOResult.value.value));
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
