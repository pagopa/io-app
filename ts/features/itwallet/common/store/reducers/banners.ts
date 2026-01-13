import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import {
  BannerHiddenPolicy,
  BannerHiddenState,
  getNextBannerState
} from "../../utils/banners";
import { itwCloseBanner, itwShowBanner } from "../actions/banners";

/**
 * Identifiers for IT Wallet banners
 * To add a new banner:
 * 1. Add a new id to this type
 * 2. Define its hiding policy in the `policies` object
 */
export type ItwBannerId = "discovery" | "upgradeMDLDetails";

/**
 * Mapping between banner identifiers and their hiding policies
 */
const policies: Record<ItwBannerId, BannerHiddenPolicy> = {
  discovery: { kind: "duration", amount: 6 * 30 /* approx. 6 months */ },
  upgradeMDLDetails: { kind: "always" }
};

export type ItwBannersState = Record<ItwBannerId, BannerHiddenState>;

/**
 * Initial state for IT Wallet banners
 */
export const itwBannersInitialState: ItwBannersState = {
  discovery: { hiddenUntil: undefined, dismissCount: 0 },
  upgradeMDLDetails: { hiddenUntil: undefined, dismissCount: 0 }
};

const reducer = (
  state: ItwBannersState = itwBannersInitialState,
  action: Action
): ItwBannersState => {
  switch (action.type) {
    case getType(itwCloseBanner): {
      const bannerId = action.payload;
      return {
        ...state,
        [bannerId]: getNextBannerState(policies[bannerId], state[bannerId])
      };
    }

    case getType(itwShowBanner): {
      const bannerId = action.payload;
      return {
        ...state,
        [bannerId]: { hiddenUntil: undefined, dismissCount: 0 }
      };
    }

    case getType(itwLifecycleStoresReset):
      return itwBannersInitialState;

    default:
      return state;
  }
};

export default reducer;
