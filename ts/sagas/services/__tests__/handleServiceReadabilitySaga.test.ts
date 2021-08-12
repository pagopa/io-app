import { testSaga } from "redux-saga-test-plan";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { markServiceAsRead } from "../../../store/actions/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../../../store/reducers/entities/services/firstServicesLoading";
import { handleServiceReadabilitySaga } from "../handleServiceReadabilitySaga";

describe("handleServiceReadabilitySaga", () => {
  const mockedServiceId = "0123" as ServiceId;

  it("makes the service with the given id being marked as read if the first service loading is not complete", () => {
    testSaga(handleServiceReadabilitySaga, mockedServiceId)
      .next()
      .select(isFirstVisibleServiceLoadCompletedSelector)
      .next(false)
      .put(markServiceAsRead(mockedServiceId))
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
