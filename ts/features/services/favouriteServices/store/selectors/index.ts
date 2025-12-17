import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import type { FavouriteServiceType } from "../../types";

export const favouriteServicesSelector = (state: GlobalState) =>
  state.features.services.favouriteServices.dataById;

export const favouriteServicesSortTypeSelector = (state: GlobalState) =>
  state.features.services.favouriteServices.sortType;

export const favouriteServicesCountSelector = createSelector(
  favouriteServicesSelector,
  services => Object.keys(services).length
);

export const favouriteServiceListSelector = createSelector(
  favouriteServicesSelector,
  Object.values
);

export const sortedFavouriteServicesSelector = createSelector(
  [favouriteServiceListSelector, favouriteServicesSortTypeSelector],
  (services, sortType) => {
    switch (sortType) {
      case "addedAt_asc":
        return [...services].sort((a, b) => a.addedAt - b.addedAt);
      case "addedAt_desc":
        return [...services].sort((a, b) => b.addedAt - a.addedAt);
      case "name_asc":
        return [...services].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return services;
    }
  }
);

export const favouriteServiceByIdSelector = (
  state: GlobalState,
  id: string
): FavouriteServiceType | undefined =>
  state.features.services.favouriteServices.dataById[id] ?? undefined;

export const isFavouriteServiceSelector = (
  state: GlobalState,
  serviceId: string
) => serviceId in state.features.services.favouriteServices.dataById;
