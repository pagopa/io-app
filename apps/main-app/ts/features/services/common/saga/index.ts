import { SagaIterator } from "redux-saga";
import { call, fork, select, takeEvery } from "typed-redux-saga/macro";

import { identityClientManager } from "../../../../api/IdentityClientManager";
import { servicesClientManager } from "../../../../api/ServicesClientManager";
import { apiUrlPrefix } from "../../../../config";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { watchServicesDetailsSaga } from "../../details/saga";
import { loadServicePreference } from "../../details/store/actions/preference";
import { watchFavouriteServicesSaga } from "../../favouriteServices/saga";
import { watchHomeSaga } from "../../home/saga";
import { watchInstitutionSaga } from "../../institution/saga";
import { watchSearchSaga } from "../../search/saga";
import { isFavouriteServicesEnabledSelector } from "../store/selectors/remoteConfig";
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
