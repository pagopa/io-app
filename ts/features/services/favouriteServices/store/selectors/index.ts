import { GlobalState } from "../../../../../store/reducers/types";
import { FavouriteServiceType } from "../../types";

export const favouriteServicesSelector = (state: GlobalState) =>
  state.features.services.favouriteServices.dataById;

export const favouriteServicesCountSelector = (state: GlobalState) =>
  Object.keys(state.features.services.favouriteServices.dataById).length;

export const favouriteServiceByIdSelector = (
  state: GlobalState,
  id: string
): FavouriteServiceType | undefined =>
  state.features.services.favouriteServices.dataById[id] ?? undefined;

export const isFavouriteServiceSelector = (
  state: GlobalState,
  serviceId: string
) => serviceId in state.features.services.favouriteServices.dataById;
