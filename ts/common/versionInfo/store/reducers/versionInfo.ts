import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { IOVersionInfo } from "../../types/IOVersionInfo";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../actions/versionInfo";

export type VersionInfoState = IOVersionInfo | null;

export const versionInfoReducer = (
  state: VersionInfoState = null,
  action: Action
): VersionInfoState => {
  switch (action.type) {
    case getType(versionInfoLoadSuccess):
      return action.payload;
    case getType(versionInfoLoadFailure):
      return null;
    default:
      return state;
  }
};

// Selectors
export const serverInfoDataSelector = (state: GlobalState) => state.versionInfo;
