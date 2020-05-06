import * as pot from "italia-ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { ServicesByScope } from "../../../../definitions/content/ServicesByScope";
import { firstServiceLoadSuccess } from "../../../store/actions/services";
import { servicesByScopeSelector } from "../../../store/reducers/content";
import { visibleServicesDetailLoadStateSelector } from "../../../store/reducers/entities/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../../../store/reducers/entities/services/firstServicesLoading";
import { handleFirstVisibleServiceLoadSaga } from "../handleFirstVisibleServiceLoadSaga";

const mockedservicesByScope: pot.Pot<ServicesByScope, Error> = pot.some({
  LOCAL: ["01", "02"],
  NATIONAL: ["03"]
});

describe("handleFirstVisibleServiceLoadSaga", () => {
  it("does nothing if the visible services loading is not completed", () => {
    testSaga(handleFirstVisibleServiceLoadSaga)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(false)
      .select(servicesByScopeSelector)
      .next(mockedservicesByScope)
      .select(visibleServicesDetailLoadStateSelector)
      .next(pot.noneLoading)
      .isDone();
  });

  it("saves on the redux store that the first service loading is completed if all the visible services have been loaded successfully", () => {
    testSaga(handleFirstVisibleServiceLoadSaga)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(false)
      .select(servicesByScopeSelector)
      .next(mockedservicesByScope)
      .select(visibleServicesDetailLoadStateSelector)
      .next(pot.some(undefined))
      .put(firstServiceLoadSuccess())
      .next()
      .isDone();
  });

  it("does nothing if the visible services are not loaded (error) and services by scope is some", () => {
    testSaga(handleFirstVisibleServiceLoadSaga)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(false)
      .select(servicesByScopeSelector)
      .next(pot.noneError)
      .select(visibleServicesDetailLoadStateSelector)
      .next(pot.some(undefined))
      .isDone();
  });
});
