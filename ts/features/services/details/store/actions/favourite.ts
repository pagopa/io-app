import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { WithServiceID } from "../../types/ServicePreferenceResponse";

export const getFavouriteService = createAsyncAction(
  "GET_FAVOURITE_SERVICE_REQUEST",
  "GET_FAVOURITE_SERVICE_SUCCESS",
  "GET_FAVOURITE_SERVICE_FAILURE"
)<ServiceId, ServiceId, WithServiceID<{ error: NetworkError }>>();

type ToggleFavouriteServiceBase = WithServiceID<{
  isFavourite: boolean;
}>;

type ToggleFavouriteServicePayload = ToggleFavouriteServiceBase & {
  onSuccess?: () => void;
  onError?: () => void;
};

type ToggleFavouriteServiceSuccessPayload = ToggleFavouriteServiceBase;

type ToggleFavouriteServiceFailurePayload = ToggleFavouriteServiceBase & {
  error: NetworkError;
};

export const toggleFavouriteService = createAsyncAction(
  "TOGGLE_FAVOURITE_SERVICE_REQUEST",
  "TOGGLE_FAVOURITE_SERVICE_SUCCESS",
  "TOGGLE_FAVOURITE_SERVICE_FAILURE"
)<
  ToggleFavouriteServicePayload,
  ToggleFavouriteServiceSuccessPayload,
  ToggleFavouriteServiceFailurePayload
>();

export type FavouriteServiceActions =
  | ActionType<typeof getFavouriteService>
  | ActionType<typeof toggleFavouriteService>;
