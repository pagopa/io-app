import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { utmLinkClearParams, utmLinkSetParams } from "../actions";

export type UtmLinkState = {
  utmSource: string | undefined;
  utmMedium: string | undefined;
  utmCampaign: string | undefined;
};

const utmLinkInitialState: UtmLinkState = {
  utmSource: undefined,
  utmMedium: undefined,
  utmCampaign: undefined
};

export const utmLinkReducer = (
  state: UtmLinkState = utmLinkInitialState,
  action: Action
): UtmLinkState => {
  switch (action.type) {
    case getType(utmLinkClearParams):
      return {
        ...utmLinkInitialState
      };
    case getType(utmLinkSetParams):
      return {
        ...action.payload
      };

    default:
      return state;
  }
};
