import { SagaIterator } from "@redux-saga/core";
import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BackendBdpClient } from "../api/backendBdpClient";
import { SagaCallReturnType } from "../../../../types/utils";
import { loadBdpActivationStatus } from "../store/actions/details";

/**
 * make a request to get the citizen status
 */
export function* handleFindCitizen(
  findCitizen: ReturnType<typeof BackendBdpClient>["find"]
): SagaIterator {
  try {
    const findCitizenResult: SagaCallReturnType<typeof findCitizen> = yield call(
      findCitizen,
      {}
    );
    if (findCitizenResult.isRight()) {
      if (findCitizenResult.value.status === 200) {
        yield put(
          loadBdpActivationStatus.success(findCitizenResult.value.value)
        );
      }
      throw new Error(`response status ${findCitizenResult.value.status}`);
    } else {
      throw new Error(readableReport(findCitizenResult.value));
    }
  } catch (e) {
    yield put(loadBdpActivationStatus.failure(e));
  }
}
