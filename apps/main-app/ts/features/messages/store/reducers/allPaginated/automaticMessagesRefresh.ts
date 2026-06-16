import { getType } from "typesafe-actions";
import { requestAutomaticMessagesRefresh } from "../../actions";
import { Action } from "../../../../../store/actions/types";
import { AllPaginated } from "./types";

export const reduceAutomaticMessageRefreshRequest = (
  state: AllPaginated,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(requestAutomaticMessagesRefresh): {
      if (action.payload === "ARCHIVE") {
        return {
          ...state,
          archive: {
            ...state.archive,
            lastUpdateTime: new Date(0)
          }
        };
      }
      return {
        ...state,
        inbox: {
          ...state.archive,
          lastUpdateTime: new Date(0)
        }
      };
    }
  }

  return state;
};
