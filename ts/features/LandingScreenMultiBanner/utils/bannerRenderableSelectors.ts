import { mapValues } from "lodash";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus";
import { GlobalState } from "../../../store/reducers/types";
import { itwLifecycleIsValidSelector } from "../../itwallet/lifecycle/store/selectors";
import { isItwTrialActiveSelector } from "../../trialSystem/store/reducers";
import { BannerMapById } from "./landingScreenBannerMap";

/**
 * extracts renderability selectors from component map,
 * and indexes them by ID
 * ----
 * @param bannerMap
 * a {[bannerID]:{ isRenderableSelector: Selector, foo:bar } } map
 * @returns
 * a {[bannerID]: isRenderableSelector } map
 */
export const renderabilitySelectorsFromBannerMap = (bannerMap: BannerMapById) =>
  mapValues(bannerMap, ({ isRenderableSelector }) => isRenderableSelector);

export const isItwDiscoveryBannerRenderableSelector = (state: GlobalState) =>
  isItwEnabledSelector(state) &&
  !itwLifecycleIsValidSelector(state) &&
  isItwTrialActiveSelector(state);
