import { IOToast } from "@io-app/design-system";
import I18n from "i18next";
import MockDate from "mockdate";
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";

import { favouriteServicesLimitSelector } from "../../../common/store/selectors/remoteConfig";
import { createMockService } from "../../__mocks__/favouriteServicesMocks";
import {
  addFavouriteServiceRequest,
  addFavouriteServiceSuccess
} from "../../store/actions";
import { favouriteServicesCountSelector } from "../../store/selectors";
import { handleAddFavouriteService } from "../handleAddFavouriteService";

const mockedDate = Date.now();
MockDate.set(mockedDate);

const mockedFavouriteService = {
  ...createMockService(),
  addedAt: mockedDate
};

describe("handleAddFavouriteService", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("should add the service and show success toast if limit is NOT reached", () =>
    expectSaga(
      handleAddFavouriteService,
      addFavouriteServiceRequest(mockedFavouriteService)
    )
      .provide([
        [select(favouriteServicesCountSelector), 5],
        [select(favouriteServicesLimitSelector), 10]
      ])
      .put(addFavouriteServiceSuccess(mockedFavouriteService))
      .call(IOToast.success, I18n.t("services.favouriteServices.toasts.added"))
      .run());

  it("should show error toast and NOT add service if limit IS reached", () =>
    expectSaga(
      handleAddFavouriteService,
      addFavouriteServiceRequest(mockedFavouriteService)
    )
      .provide([
        [select(favouriteServicesCountSelector), 10],
        [select(favouriteServicesLimitSelector), 10]
      ])
      .call(
        IOToast.error,
        I18n.t("services.favouriteServices.toasts.limitReached")
      )
      .run());
});
