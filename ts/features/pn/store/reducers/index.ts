import { isLeft } from "fp-ts/lib/Either";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { isUserSelectedPaymentSelector } from "../../../messages/store/reducers/payments";
import { aarFlowReducer } from "../../aar/store/reducers";
import { AARFlowState } from "../../aar/utils/stateUtils";
import {
  persistedPnBannerDismissReducer,
  PnBannerDismissState
} from "../../reminderBanner/reducer/bannerDismiss";
import { getRptIdStringFromPayment } from "../../utils/rptId";
import {
  persistedSendLoginEngagementReducer,
  type SENDLoginEngagementState
} from "../../loginEngagement/store/reducers";
import { thirdPartyFromIdSelector } from "../../../messages/store/reducers/thirdPartyById";
import { ThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
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

export const sendMessageFromIdSelector = (
  state: GlobalState,
  id: string
): ThirdPartyMessage | undefined => {
  const thirdPartyMessageContainerPot = thirdPartyFromIdSelector(state, id);
  const thirdPartyMessageContainer = pot.toUndefined(
    thirdPartyMessageContainerPot
  );
  const thirdPartyMessage = thirdPartyMessageContainer?.third_party_message;
  const sendThirdPartyMessageEither =
    ThirdPartyMessage.decode(thirdPartyMessage);
  if (isLeft(sendThirdPartyMessageEither)) {
    return undefined;
  }
  const sendThirdPartyMessage = sendThirdPartyMessageEither.right;
  if (sendThirdPartyMessage.details == null) {
    return undefined;
  }
  return thirdPartyMessage as ThirdPartyMessage;
};

export const sendMessageCreationDateSelector = (
  state: GlobalState,
  id: string
): Date | undefined => {
  const thirdPartyMessageContainerPot = thirdPartyFromIdSelector(state, id);
  const thirdPartyMessageContainer = pot.toUndefined(
    thirdPartyMessageContainerPot
  );
  return thirdPartyMessageContainer?.created_at;
};

export const sendUserSelectedPaymentRptIdSelector = (
  state: GlobalState,
  sendMessage: ThirdPartyMessage | undefined
) => {
  const recipients = sendMessage?.details?.recipients;
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
