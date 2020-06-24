import { SagaIterator } from "redux-saga";
import { select } from "redux-saga/effects";
import { navigationCurrentRouteSelector } from "../../../../store/reducers/navigation";
import { availableBonusTypesSelectorFromId } from "../reducers/availableBonusesTypes";
import { ID_BONUS_VACANZE_TYPE } from "../../utils/bonus";
import { RTron } from "../../../../boot/configureStoreAndPersistor";

export function* handleForceBonusServiceActivation(): SagaIterator {
  // first check if we know about the service
  const bonusVacanze: ReturnType<
    typeof availableBonusTypesSelectorFromId
  > = yield select(availableBonusTypesSelectorFromId(ID_BONUS_VACANZE_TYPE));
}
