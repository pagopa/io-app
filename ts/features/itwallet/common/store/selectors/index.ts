import { isItwEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { isItwTrialActiveSelector } from "../../../../trialSystem/store/reducers";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";

export const isItwDiscoveryBannerRenderableSelector = (state: GlobalState) =>
  isItwTrialActiveSelector(state) &&
  !itwLifecycleIsValidSelector(state) &&
  isItwEnabledSelector(state);
