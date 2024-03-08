import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../../store/actions/types";
import { thirdPartyFromIdSelector } from "../../../messages/store/reducers/thirdPartyById";
import { toPNMessage } from "../types/transformers";
import { UIMessageId } from "../../../messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import { PNMessage } from "../types/types";
import { getRptIdStringFromPayment } from "../../utils/rptId";
import { isUserSelectedPaymentSelector } from "../../../messages/store/reducers/payments";
import { pnActivationReducer, PnActivationState } from "./activation";

export type PnState = {
  activation: PnActivationState;
};

export const pnReducer = combineReducers<PnState, Action>({
  activation: pnActivationReducer
});

export const pnMessageFromIdSelector = createSelector(
  thirdPartyFromIdSelector,
  thirdPartyMessage => pot.map(thirdPartyMessage, _ => toPNMessage(_))
);

export const pnMessageAttachmentSelector =
  (state: GlobalState) =>
  (ioMessageId: UIMessageId) =>
  (pnMessageAttachmentId: string) =>
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
