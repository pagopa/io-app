import I18n from "i18next";
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { IOToast } from "@pagopa/io-app-design-system";
import { handleAddFavouriteService } from "../handleAddFavouriteService";
import {
  addFavouriteServiceRequest,
  addFavouriteServiceSuccess
} from "../../store/actions";
import { favouriteServicesCountSelector } from "../../store/selectors";
import { createMockFavouriteService } from "../../__mocks__";
import { favouriteServicesLimitSelector } from "../../../common/store/selectors/remoteConfig";

const FAVOURITE_SERVICE = createMockFavouriteService();

describe("handleAddFavouriteService", () => {
  it("should add the service and show success toast if limit is NOT reached", () =>
    expectSaga(
      handleAddFavouriteService,
      addFavouriteServiceRequest(FAVOURITE_SERVICE)
    )
      .provide([
        [select(favouriteServicesCountSelector), 5],
        [select(favouriteServicesLimitSelector), 10]
      ])
      .put(addFavouriteServiceSuccess(FAVOURITE_SERVICE))
      .call(IOToast.success, I18n.t("services.favouriteServices.toasts.added"))
      .run());

  it("should show error toast and NOT add service if limit IS reached", () =>
    expectSaga(
      handleAddFavouriteService,
      addFavouriteServiceRequest(FAVOURITE_SERVICE)
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
