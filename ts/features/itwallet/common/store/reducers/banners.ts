import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { itwCloseBanner, itwShowBanner } from "../actions/banners";
import { NonEmptyArray } from "../../../../../types/helpers";

/**
 * Pseudo-infinite duration in days.
 * Used to hide banners "forever" or until app reset/reinstallation.
 */
const FOREVER = 100 * 365; // approx. 100 years

/**
 * Identifiers for IT Wallet banners
 * To add a new banner add a new id to this type
 */
export type ItwBannerId =
  | "discovery" // (Legacy) Discovery banner for Documenti su IO
  | "discovery_wallet" // Discovery banner for IT Wallet placed in the wallet screen
| "discovery_messages_inbox" // Discovery banner for IT Wallet placed in the messages inbox screen
  | "upgradeMDLDetails"; // Upgrade to IT Wallet banner placed in MDL details screen

/**
 * Mapping between banner identifiers and the duration (expressed in days) for which they should be hidden
 * after each dismissal.
 */
export const bannerHideDurations: Record<ItwBannerId, NonEmptyArray<number>> = {
  discovery: [6 * 30], // ~6 months
  discovery_wallet: [30, 60, 120], // ~1 month, ~2 months, ~4 months
  discovery_messages_inbox: [30, 60, 120], // ~1 month, ~2 months, ~4 months
  upgradeMDLDetails: [FOREVER]
};

export type ItwBannersState = Partial<
  Record<
    ItwBannerId,
    {
      /** The last time the banner was dismissed */
      dismissedOn?: string;
      /** How many times the banner was dismissed */
      dismissCount?: number;
    }
  >
>;

/**
 * Initial state for IT Wallet banners
 */
export const itwBannersInitialState: ItwBannersState = {};

const reducer = (
  state: ItwBannersState = itwBannersInitialState,
  action: Action
): ItwBannersState => {
  switch (action.type) {
    case getType(itwCloseBanner): {
      const bannerId = action.payload;
      const current = state[bannerId];

      const dismissedOn = new Date().toISOString();
      const dismissCount = (current?.dismissCount ?? 0) + 1;

      return {
        ...state,
        [bannerId]: {
          dismissedOn,
          dismissCount
        }
      };
    }

    case getType(itwShowBanner): {
      const bannerId = action.payload;
      return {
        ...state,
        [bannerId]: {}
      };
    }

    case getType(itwLifecycleStoresReset):
      return itwBannersInitialState;

    default:
      return state;
  }
};

export default reducer;
