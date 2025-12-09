import { ActionType, createStandardAction } from "typesafe-actions";
import { ServiceType } from "../../../favouriteServices/types";

export const addFavouriteServiceRequest = createStandardAction(
  "ADD_FAVOURITE_SERVICE_REQUEST"
)<ServiceType>();

export const addFavouriteServiceSuccess = createStandardAction(
  "ADD_FAVOURITE_SERVICE_SUCCESS"
)<ServiceType>();

export const removeFavouriteService = createStandardAction(
  "REMOVE_FAVOURITE_SERVICE"
)<{ id: string }>();

export type FavouriteServicesActions =
  | ActionType<typeof addFavouriteServiceRequest>
  | ActionType<typeof addFavouriteServiceSuccess>
  | ActionType<typeof removeFavouriteService>;
