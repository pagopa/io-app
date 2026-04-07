import { testSaga } from "redux-saga-test-plan";

import { watchServicesSaga } from "..";
import { BackendClient } from "../../../../../api/backend";
import { apiUrlPrefix } from "../../../../../config";
import { watchServicesDetailsSaga } from "../../../details/saga";
import { loadServicePreference } from "../../../details/store/actions/preference";
import { watchFavouriteServicesSaga } from "../../../favouriteServices/saga";
import { watchHomeSaga } from "../../../home/saga";
import { watchInstitutionSaga } from "../../../institution/saga";
import { watchSearchSaga } from "../../../search/saga";
import { createServicesClient, ServicesClient } from "../../api/servicesClient";
import { isFavouriteServicesEnabledSelector } from "../../store/selectors/remoteConfig";
import { specialServicePreferencesSaga } from "../specialServicePreferencesSaga";

describe("index", () => {
  describe("watchServicesSaga", () => {
    it("should follow expected flow", () => {
      const backendClient = {} as BackendClient;
      const bearerToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakePayload.XYZ123abcDEF456ghi789JKL";
      const servicesClient = {} as ServicesClient;
      testSaga(watchServicesSaga, backendClient, bearerToken)
        .next()
        .call(createServicesClient, apiUrlPrefix, bearerToken)
        .next(servicesClient)
        .fork(watchServicesDetailsSaga, backendClient, servicesClient)
        .next()
        .fork(watchHomeSaga, servicesClient)
        .next()
        .fork(watchInstitutionSaga, servicesClient)
        .next()
        .fork(watchSearchSaga, servicesClient)
        .next()
        .select(isFavouriteServicesEnabledSelector)
        .next(true)
        .fork(watchFavouriteServicesSaga)
        .next()
        .takeEvery(loadServicePreference.success, specialServicePreferencesSaga)
        .next()
        .isDone();
    });
  });
});
