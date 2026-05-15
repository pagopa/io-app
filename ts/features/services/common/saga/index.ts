import { SagaIterator } from "redux-saga";
import { call, fork, select, takeEvery } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { watchHomeSaga } from "../../home/saga";
import { watchInstitutionSaga } from "../../institution/saga";
import { watchSearchSaga } from "../../search/saga";
import { watchServicesDetailsSaga } from "../../details/saga";
import { watchFavouriteServicesSaga } from "../../favouriteServices/saga";
import { loadServicePreference } from "../../details/store/actions/preference";
import { isFavouriteServicesEnabledSelector } from "../store/selectors/remoteConfig";
import { identityClientManager } from "../../../../api/IdentityClientManager";
import { servicesClientManager } from "../../../../api/ServicesClientManager";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { specialServicePreferencesSaga } from "./specialServicePreferencesSaga";

export function* watchServicesSaga(
  keyInfo: KeyInfo,
  sessionToken: string
): SagaIterator {
  const identityClient = yield* call(
    [identityClientManager, identityClientManager.getClient],
    apiUrlPrefix,
    { keyInfo, token: sessionToken }
  );
  const servicesClient = yield* call(
    [servicesClientManager, servicesClientManager.getClient],
    apiUrlPrefix,
    { token: sessionToken }
  );

  yield* fork(watchServicesDetailsSaga, identityClient, servicesClient);
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
