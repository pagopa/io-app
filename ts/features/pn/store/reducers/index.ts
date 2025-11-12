import * as pot from "@pagopa/ts-commons/lib/pot";
import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import { createSelector } from "reselect";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { isUserSelectedPaymentSelector } from "../../../messages/store/reducers/payments";
import { thirdPartyFromIdSelector } from "../../../messages/store/reducers/thirdPartyById";
import { aarFlowReducer } from "../../aar/store/reducers";
import { AARFlowState } from "../../aar/utils/stateUtils";
import {
  persistedPnBannerDismissReducer,
  PnBannerDismissState
} from "../../reminderBanner/reducer/bannerDismiss";
import { getRptIdStringFromPayment } from "../../utils/rptId";
import { toSENDMessage } from "../types/transformers";
import { PNMessage } from "../types/types";
import {
  persistedSendLoginEngagementReducer,
  type SENDLoginEngagementState
} from "../../loginEngagement/store/reducers";
import { pnActivationReducer, PnActivationState } from "./activation";

export type PnState = {
  activation: PnActivationState;
  bannerDismiss: PnBannerDismissState & PersistPartial;
  aarFlow: AARFlowState;
  loginEngagement: SENDLoginEngagementState & PersistPartial;
};

export const pnReducer = combineReducers<PnState, Action>({
  activation: pnActivationReducer,
  bannerDismiss: persistedPnBannerDismissReducer,
  aarFlow: aarFlowReducer,
  loginEngagement: persistedSendLoginEngagementReducer
});

export const sendMessageFromIdSelector = createSelector(
  thirdPartyFromIdSelector,
  thirdPartyMessagePot => {
    const thirdPartyMessage = pot.getOrElse(thirdPartyMessagePot, undefined);
    if (thirdPartyMessage == null) {
      return undefined;
    }
    // Be aware that this call generates a new instance so
    // we have to cache the function using createSelector
    return toSENDMessage(thirdPartyMessage);
  }
);

export const sendUserSelectedPaymentRptIdSelector = (
  state: GlobalState,
  sendMessage: PNMessage | undefined
) => {
  const recipients = sendMessage?.recipients;
  if (recipients == null) {
    return undefined;
  }
  for (const recipient of recipients) {
    const payment = recipient.payment;
    if (payment != null) {
      const paymentRptId = getRptIdStringFromPayment(payment);
      if (isUserSelectedPaymentSelector(state, paymentRptId)) {
        return paymentRptId;
      }
    }
  }
  return undefined;
};
