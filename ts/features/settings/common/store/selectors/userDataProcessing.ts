import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";

export const userDataProcessingSelector = (state: GlobalState) =>
  state.userDataProcessing;

export const isUserDataProcessingDeleteLoadingSelector = (
  state: GlobalState
) => {
  const deleteChoice = state.userDataProcessing.DELETE;

  return pot.isLoading(deleteChoice) || pot.isUpdating(deleteChoice);
};

export const isUserDataProcessingDeleteErrorSelector = (state: GlobalState) =>
  pot.isError(state.userDataProcessing.DELETE);
