import { isAARRemoteEnabled } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isAARLocalEnabled } from "../../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../../store/reducers/types";

export const isAAREnabled = (state: GlobalState): boolean | null =>
  isAARLocalEnabled(state) && isAARRemoteEnabled(state);
