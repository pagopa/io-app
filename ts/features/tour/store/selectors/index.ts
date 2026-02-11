import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";

const tourStateSelector = (state: GlobalState) => state.features.tour;

export const isTourActiveSelector = createSelector(
  tourStateSelector,
  tour => tour.activeGroupId !== undefined
);

export const activeGroupIdSelector = createSelector(
  tourStateSelector,
  tour => tour.activeGroupId
);

export const activeStepIndexSelector = createSelector(
  tourStateSelector,
  tour => tour.activeStepIndex
);

export const tourItemsForActiveGroupSelector = createSelector(
  tourStateSelector,
  tour => {
    const groupId = tour.activeGroupId;
    if (groupId === undefined) {
      return [];
    }
    const items = tour.items[groupId] ?? [];
    return [...items].sort((a, b) => a.index - b.index);
  }
);

export const isTourCompletedSelector =
  (groupId: string) => (state: GlobalState) =>
    state.features.tour.completed.includes(groupId);
