//
import { call, Effect, put, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import { SagaCallReturnType } from "../../../../types/utils";
import { apiUrlPrefix } from "../../../../config";

export function* watchLoadBonusListSata(): SagaIterator {
  const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);
  const backendInfoResponse: SagaCallReturnType<
    typeof backendBonusVacanze["getBonusList"]
  > = yield call(backendBonusVacanze.getBonusList, {});
}
