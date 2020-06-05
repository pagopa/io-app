import { put, cancelled, take, call } from "redux-saga/effects";
import { RTron } from "../../../../boot/configureStoreAndPersistor";

// TODO: rename after merging
import { navigateToBonusEligibilityLoading } from "../../navigation/action";
import { cancelBonusEligibility } from "../actions/bonusVacanze";

function* secondFunction() {
  try {
    yield take(cancelBonusEligibility);
    RTron.log("secondFunction");
  } finally {
    if (yield cancelled()) {
      RTron.log("CANCELLED SECOND");
    }
  }
}

export function* beginBonusEligibilitySaga() {
  yield put(navigateToBonusEligibilityLoading());

  yield call(secondFunction);

  RTron.log("beginBonusEligibilitySaga");
}
