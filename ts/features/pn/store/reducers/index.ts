import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
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
import { toPNMessage } from "../types/transformers";
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

export const pnMessageFromIdSelector = createSelector(
  thirdPartyFromIdSelector,
  thirdPartyMessage => pot.map(thirdPartyMessage, _ => toPNMessage(_))
);

export const pnUserSelectedPaymentRptIdSelector = (
  state: GlobalState,
  pnMessagePot: pot.Pot<O.Option<PNMessage>, Error>
) =>
  pipe(
    pnMessagePot,
    pot.toOption,
    O.flatten,
    O.map(message => message.recipients),
    O.chain(recipients =>
      pipe(
        recipients,
        RA.findFirstMap(recipient =>
          pipe(
            recipient.payment,
            O.fromNullable,
            O.map(getRptIdStringFromPayment),
            O.map(rptId => isUserSelectedPaymentSelector(state, rptId)),
            O.getOrElse(() => false)
          )
            ? O.fromNullable(recipient.payment)
            : O.none
        )
      )
    ),
    O.map(getRptIdStringFromPayment),
    O.toUndefined
  );
