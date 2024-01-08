import * as pot from "@pagopa/ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { thirdPartyFromIdSelector } from "../../../messages/store/reducers/thirdPartyById";
import { toPNMessage } from "../types/transformers";
import { UIAttachmentId, UIMessageId } from "../../../messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import { pnActivationReducer, PnActivationState } from "./activation";
import { MultiplePaymentState, paymentsReducer } from "./payments";

export type PnState = {
  activation: PnActivationState;
  payments: MultiplePaymentState;
};

export const pnReducer = combineReducers<PnState, Action>({
  activation: pnActivationReducer,
  payments: paymentsReducer
});

export const pnMessageFromIdSelector = createSelector(
  thirdPartyFromIdSelector,
  thirdPartyMessage => pot.map(thirdPartyMessage, _ => toPNMessage(_))
);

export const pnMessageAttachmentSelector =
  (state: GlobalState) =>
  (ioMessageId: UIMessageId) =>
  (pnMessageAttachmentId: UIAttachmentId) =>
    pipe(
      pnMessageFromIdSelector(state, ioMessageId),
      pot.toOption,
      O.flatten,
      O.chainNullableK(pnMessage => pnMessage.attachments),
      O.chainNullableK(pnMessageAttachments =>
        pnMessageAttachments.find(
          pnMessageAttachment =>
            pnMessageAttachment.id === pnMessageAttachmentId
        )
      )
    );
