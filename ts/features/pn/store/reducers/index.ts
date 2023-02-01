import * as pot from "@pagopa/ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Action } from "../../../../store/actions/types";
import { thirdPartyFromIdSelector } from "../../../../store/reducers/entities/messages/thirdPartyById";
import { toPNMessage } from "../types/transformers";
import {
  UIAttachmentId,
  UIMessageId
} from "../../../../store/reducers/entities/messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import { PnPreferences, pnPreferencesReducer } from "./preferences";
import { pnActivationReducer, PnActivationState } from "./activation";

export type PnState = {
  preferences: PnPreferences;
  activation: PnActivationState;
};

export const pnReducer = combineReducers<PnState, Action>({
  preferences: pnPreferencesReducer,
  activation: pnActivationReducer
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
