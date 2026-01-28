import { ActionType, createStandardAction } from "typesafe-actions";
import type {
  FavouriteServicesSortType,
  FavouriteServiceType
} from "../../../favouriteServices/types";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

export const addFavouriteServiceRequest = createStandardAction(
  "ADD_FAVOURITE_SERVICE_REQUEST"
)<FavouriteServiceType>();

export const addFavouriteServiceSuccess = createStandardAction(
  "ADD_FAVOURITE_SERVICE_SUCCESS"
)<FavouriteServiceType>();

export const removeFavouriteService = createStandardAction(
  "REMOVE_FAVOURITE_SERVICE"
)<{ id: ServiceId }>();

export const setFavouriteServicesSortType = createStandardAction(
  "SET_FAVOURITE_SERVICES_SORT_TYPE"
)<FavouriteServicesSortType>();

export type FavouriteServicesActions =
  | ActionType<typeof addFavouriteServiceRequest>
  | ActionType<typeof addFavouriteServiceSuccess>
  | ActionType<typeof removeFavouriteService>
  | ActionType<typeof setFavouriteServicesSortType>;
