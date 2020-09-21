import { SagaIterator } from "redux-saga";
import { RTron } from "../../../../boot/configureStoreAndPersistor";

export function* watchBonusBpdSaga(bpdBearerToken: string): SagaIterator {
  RTron.log("watchBonusBpdSaga");
}
