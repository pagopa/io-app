import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { utmLinkClearCampaign, utmLinkSetCampaign } from "../actions";

export type UtmLinkState = {
  utmCampaign: string | undefined;
};

const utmLinkInitialState: UtmLinkState = {
  utmCampaign: undefined
};

export const utmLinkReducer = (
  state: UtmLinkState = utmLinkInitialState,
  action: Action
): UtmLinkState => {
  switch (action.type) {
    case getType(utmLinkClearCampaign):
      return {
        utmCampaign: undefined
      };
    case getType(utmLinkSetCampaign):
      return {
        utmCampaign: action.payload
      };

    default:
      return state;
  }
};
