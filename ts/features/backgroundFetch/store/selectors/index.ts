import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { BackgroundFetchState } from "../reducers";

export const backgroundFetchStateSelector = (state: GlobalState) =>
  state.features.backgroundFetch;

export const backgroundFetchStatusSelector = createSelector(
  backgroundFetchStateSelector,
  ({ status }: BackgroundFetchState) => status
);
