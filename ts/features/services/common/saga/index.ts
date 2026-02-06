import { SagaIterator } from "redux-saga";
import { call, fork, select, takeEvery } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { watchHomeSaga } from "../../home/saga";
import { watchInstitutionSaga } from "../../institution/saga";
import { watchSearchSaga } from "../../search/saga";
import { createServicesClient } from "../api/servicesClient";
import { watchServicesDetailsSaga } from "../../details/saga";
import { watchFavouriteServicesSaga } from "../../favouriteServices/saga";
import { IDBackendClient } from "../../../../api/BackendClientManager";
import { loadServicePreference } from "../../details/store/actions/preference";
import { isFavouriteServicesEnabledSelector } from "../store/selectors/remoteConfig";
import { specialServicePreferencesSaga } from "./specialServicePreferencesSaga";

export function* watchServicesSaga(
  backendClient: IDBackendClient,
  bearerToken: SessionToken
): SagaIterator {
  const servicesClient = yield* call(
    createServicesClient,
    apiUrlPrefix,
    bearerToken
  );

  yield* fork(watchServicesDetailsSaga, backendClient, servicesClient);
  yield* fork(watchHomeSaga, servicesClient);
  yield* fork(watchInstitutionSaga, servicesClient);
  yield* fork(watchSearchSaga, servicesClient);

  const isFavouriteServicesEnabled = yield* select(
    isFavouriteServicesEnabledSelector
  );
  if (isFavouriteServicesEnabled) {
    yield* fork(watchFavouriteServicesSaga);
  }

  yield* takeEvery(
    loadServicePreference.success,
    specialServicePreferencesSaga
  );
}
