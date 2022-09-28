import * as pot from "@pagopa/ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { firstServiceLoadSuccess } from "../../../store/actions/services";
import { visibleServicesDetailLoadStateSelector } from "../../../store/reducers/entities/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../../../store/reducers/entities/services/firstServicesLoading";
import { handleFirstVisibleServiceLoadSaga } from "../handleFirstVisibleServiceLoadSaga";

describe("handleFirstVisibleServiceLoadSaga", () => {
  it("does nothing if the visible services loading is not completed", () => {
    testSaga(handleFirstVisibleServiceLoadSaga)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(false)
      .select(visibleServicesDetailLoadStateSelector)
      .next(pot.noneLoading)
      .isDone();
  });

  it("saves on the redux store that the first service loading is completed if all the visible services have been loaded successfully", () => {
    testSaga(handleFirstVisibleServiceLoadSaga)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(false)
      .select(visibleServicesDetailLoadStateSelector)
      .next(pot.some(undefined))
      .put(firstServiceLoadSuccess())
      .next()
      .isDone();
  });

  it("does nothing if the visible services are not loaded (error)", () => {
    testSaga(handleFirstVisibleServiceLoadSaga)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(false)
      .select(visibleServicesDetailLoadStateSelector)
      .next(pot.noneError)
      .isDone();
  });
});
