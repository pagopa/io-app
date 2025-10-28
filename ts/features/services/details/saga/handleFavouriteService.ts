import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ServicesClient } from "../../common/api/client";
import { SagaCallReturnType } from "../../../../types/utils";
import { getNetworkError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import {
  getFavouriteService,
  toggleFavouriteService
} from "../store/actions/favourite";
import { readablePrivacyReport } from "../../../../utils/reporters";

export function* handleGetFavouriteService(
  getUserFavouriteService: ServicesClient["getUserFavouriteService"],
  action: ActionType<typeof getFavouriteService.request>
) {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      getUserFavouriteService({
        serviceId: action.payload
      })
    )) as unknown as SagaCallReturnType<typeof getUserFavouriteService>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        return;
      }

      if (response.right.status === 200) {
        yield* put(getFavouriteService.success(action.payload));
        return;
      }

      // not handled error codes
      throw Error(`response status code ${response.right.status}`);
    }
    // cannot decode response
    throw Error(readablePrivacyReport(response.left));
  } catch (e) {
    yield* put(
      getFavouriteService.failure({
        id: action.payload,
        error: getNetworkError(e)
      })
    );
  }
}

export function* handleToggleFavouriteService(
  apiCall:
    | ServicesClient["setUserFavouriteService"]
    | ServicesClient["removeUserFavouriteService"],
  action: ActionType<typeof toggleFavouriteService.request>
) {
  const { id, isFavourite, onError, onSuccess } = action.payload;

  try {
    const response = (yield* call(
      withRefreshApiCall,
      apiCall({
        serviceId: id
      })
    )) as unknown as SagaCallReturnType<typeof apiCall>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        return;
      }

      if (response.right.status === 204) {
        yield* put(
          toggleFavouriteService.success({
            id,
            isFavourite
          })
        );
        onSuccess?.();
        return;
      }
      // not handled error codes
      throw Error(`response status code ${response.right.status}`);
    }
    // cannot decode response
    throw Error(readablePrivacyReport(response.left));
  } catch (e) {
    yield* put(
      toggleFavouriteService.failure({
        id,
        isFavourite: !isFavourite,
        error: getNetworkError(e)
      })
    );
    onError?.();
  }
}
