import MockDate from "mockdate";
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { addFavouriteServiceSuccess } from "../../store/actions";
import { favouriteServiceByIdSelector } from "../../store/selectors";
import { createMockService, createMockServiceDetails } from "../../__mocks__";
import { handleSyncFavouriteService } from "../handleSyncFavouriteService";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { loadServiceDetail } from "../../../details/store/actions/details";

const mockedDate = Date.now();
MockDate.set(mockedDate);

const mockedServiceId = "ServiceId" as ServiceId;
const mockedServiceDetails = createMockServiceDetails({ id: mockedServiceId });
const mockedFavouriteService = {
  ...createMockService({ id: mockedServiceId }),
  addedAt: mockedDate
};

describe("handleSyncFavouriteService", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("should not update the service if it is not a favourite", () =>
    expectSaga(
      handleSyncFavouriteService,
      loadServiceDetail.success(mockedServiceDetails)
    )
      .provide([
        [select(favouriteServiceByIdSelector, mockedServiceId), undefined]
      ])
      .not.put(addFavouriteServiceSuccess(mockedFavouriteService))
      .run());

  it("should not update the service if it has not changed", () =>
    expectSaga(
      handleSyncFavouriteService,
      loadServiceDetail.success(mockedServiceDetails)
    )
      .provide([
        [
          select(favouriteServiceByIdSelector, mockedServiceId),
          mockedFavouriteService
        ]
      ])
      .not.put(addFavouriteServiceSuccess(mockedFavouriteService))
      .run());

  it("should update the favourite service if it has changed", () =>
    expectSaga(
      handleSyncFavouriteService,
      loadServiceDetail.success({ ...mockedServiceDetails, name: "New_Name" })
    )
      .provide([
        [
          select(favouriteServiceByIdSelector, mockedServiceId),
          mockedFavouriteService
        ]
      ])
      .put(
        addFavouriteServiceSuccess({
          ...mockedFavouriteService,
          name: "New_Name"
        })
      )
      .run());
});
