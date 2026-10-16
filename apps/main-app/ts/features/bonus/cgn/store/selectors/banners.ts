import * as pot from "@pagopa/ts-commons/lib/pot";

import {
  engagementCGNDiscoveryBannerSelector,
  isCGNDiscoveryBannerEnabledSelector
} from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { profileSelector } from "../../../../settings/common/store/selectors";
import { canAccessCgn } from "../../utils/dates";
import { cgnDetailSelector, isCgnEnrolledSelector } from "../reducers/details";

export const isCgnEligibleByAgeSelector = (state: GlobalState): boolean =>
  canAccessCgn(pot.toUndefined(profileSelector(state)));

export const isCgnEngagementBannerRenderableSelector = (
  state: GlobalState
): boolean =>
  !state.bonus.cgn.banners.discoveryBannerClosed &&
  isCGNDiscoveryBannerEnabledSelector(state) &&
  isCgnEligibleByAgeSelector(state) &&
  !!engagementCGNDiscoveryBannerSelector(state) &&
  !isCgnEnrolledSelector(state) &&
  !pot.isLoading(cgnDetailSelector(state));
