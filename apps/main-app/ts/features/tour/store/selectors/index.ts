import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";

const tourStateSelector = (state: GlobalState) => state.features.tour;

export const isTourActiveSelector = (state: GlobalState) =>
  state.features.tour.activeGroupId !== undefined;

export const activeGroupIdSelector = (state: GlobalState) =>
  state.features.tour.activeGroupId;

export const activeStepIndexSelector = (state: GlobalState) =>
  state.features.tour.activeStepIndex;

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

export const isTourCompletedSelector = (state: GlobalState, groupId: string) =>
  state.features.tour.completed.includes(groupId);
