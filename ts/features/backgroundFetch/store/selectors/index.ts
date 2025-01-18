import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { BackgroundFetchState } from "../reducers";
import { BackgroundFetchTaskId } from "../../utils/tasks";

export const backgroundFetchStateSelector = (state: GlobalState) =>
  state.features.backgroundFetch;

export const backgroundFetchStatusSelector = createSelector(
  backgroundFetchStateSelector,
  ({ status }: BackgroundFetchState) => status
);

export const backgroundFetchTasksSelector = createSelector(
  backgroundFetchStateSelector,
  ({ tasks }: BackgroundFetchState) => tasks
);

export const backgroundFetchTaskByIdSelector = createSelector(
  backgroundFetchTasksSelector,
  (_: GlobalState, taskId: string) => taskId,
  (tasks, taskId) => tasks[taskId as BackgroundFetchTaskId]
);
