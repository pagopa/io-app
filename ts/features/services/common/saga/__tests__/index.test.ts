import { testSaga } from "redux-saga-test-plan";
import { watchServicesSaga } from "..";
import {
  IdentityClient,
  identityClientManager
} from "../../../../../api/IdentityClientManager";
import { apiUrlPrefix } from "../../../../../config";
import { watchServicesDetailsSaga } from "../../../details/saga";
import { watchHomeSaga } from "../../../home/saga";
import { watchInstitutionSaga } from "../../../institution/saga";
import { watchSearchSaga } from "../../../search/saga";
import { loadServicePreference } from "../../../details/store/actions/preference";
import { watchFavouriteServicesSaga } from "../../../favouriteServices/saga";
import { specialServicePreferencesSaga } from "../specialServicePreferencesSaga";
import { isFavouriteServicesEnabledSelector } from "../../store/selectors/remoteConfig";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import {
  ServicesClient,
  servicesClientManager
} from "../../../../../api/ServicesClientManager";

jest.mock("../../../../../api/IdentityClientManager");
jest.mock("../../../../../api/ServicesClientManager");

describe("index", () => {
  describe("watchServicesSaga", () => {
    it("should follow expected flow", () => {
      const keyInfo = {} as KeyInfo;
      const sessionToken = "mock-session-token";
      const identityClient = {} as IdentityClient;
      const servicesClient = {} as ServicesClient;

      testSaga(watchServicesSaga, keyInfo, sessionToken)
        .next()
        .call(identityClientManager.getClient, apiUrlPrefix, {
          keyInfo,
          token: sessionToken
        })
        .next(identityClient)
        .call(servicesClientManager.getClient, apiUrlPrefix, {
          token: sessionToken
        })
        .next(servicesClient)
        .fork(watchServicesDetailsSaga, identityClient, servicesClient)
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
