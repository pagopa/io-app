import { testSaga } from "redux-saga-test-plan";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { markServiceAsRead } from "../../../store/actions/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../../../store/reducers/entities/services/firstServicesLoading";
import { handleServiceReadabilitySaga } from "../services";

describe("handleServiceReadabilitySaga", () => {
  const mockedServiceId: string = "0123";

  it("makes the service with the given id being marked as read if the first service loading is not complete", () => {
    testSaga(handleServiceReadabilitySaga, mockedServiceId)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(false)
      .put(markServiceAsRead(mockedServiceId as ServiceId))
      .next()
      .isDone();
  });

  it("do nothing if the first service loading has been completed ", () => {
    testSaga(handleServiceReadabilitySaga, mockedServiceId)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(true)
      .isDone();
  });
});
