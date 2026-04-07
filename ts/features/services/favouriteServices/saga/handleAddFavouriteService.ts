import I18n from "i18next";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { IOToast } from "@pagopa/io-app-design-system";
import {
  addFavouriteServiceRequest,
  addFavouriteServiceSuccess
} from "../store/actions";
import { favouriteServicesCountSelector } from "../store/selectors";
import { favouriteServicesLimitSelector } from "../../common/store/selectors/remoteConfig";
import * as analytics from "../../common/analytics";

export function* handleAddFavouriteService(
  action: ActionType<typeof addFavouriteServiceRequest>
) {
  const favouriteServicesCount = yield* select(favouriteServicesCountSelector);
  const favouriteServicesLimit = yield* select(favouriteServicesLimitSelector);

  if (favouriteServicesCount >= favouriteServicesLimit) {
    yield* call(
      analytics.trackServicesFavouritesLimitReached,
      action.payload.id
    );
    yield* call(
      IOToast.error,
      I18n.t("services.favouriteServices.toasts.limitReached")
    );
    return;
  }
  yield* put(addFavouriteServiceSuccess(action.payload));
  yield* call(
    IOToast.success,
    I18n.t("services.favouriteServices.toasts.added")
  );
}
