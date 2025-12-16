import { ActionType, createStandardAction } from "typesafe-actions";
import { ServiceType } from "../../../favouriteServices/types";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

export const addFavouriteServiceRequest = createStandardAction(
  "ADD_FAVOURITE_SERVICE_REQUEST"
)<ServiceType>();

export const addFavouriteServiceSuccess = createStandardAction(
  "ADD_FAVOURITE_SERVICE_SUCCESS"
)<ServiceType>();

export const removeFavouriteService = createStandardAction(
  "REMOVE_FAVOURITE_SERVICE"
)<{ id: ServiceId }>();

export type FavouriteServicesActions =
  | ActionType<typeof addFavouriteServiceRequest>
  | ActionType<typeof addFavouriteServiceSuccess>
  | ActionType<typeof removeFavouriteService>;
