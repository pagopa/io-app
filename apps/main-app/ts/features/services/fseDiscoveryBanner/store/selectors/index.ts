import { fseDiscoveryBannerWebUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { isTestEnv } from "../../../../../utils/environment";

const isFseDiscoveryBannerDismissedSelector = (state: GlobalState): boolean =>
  state.features.services.fseDiscoveryBanner.isDismissed;

export const isFseDiscoveryBannerRenderableSelector = (
  state: GlobalState
): boolean =>
  !isFseDiscoveryBannerDismissedSelector(state) &&
  fseDiscoveryBannerWebUrlSelector(state) !== undefined;

export const testable = isTestEnv
  ? {
      isFseDiscoveryBannerDismissedSelector
    }
  : undefined;
