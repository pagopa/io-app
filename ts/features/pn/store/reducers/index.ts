import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import { createSelector, createSelectorCreator } from "reselect";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { isUserSelectedPaymentSelector } from "../../../messages/store/reducers/payments";
import { thirdPartyFromIdSelector } from "../../../messages/store/reducers/thirdPartyById";
import { aarFlowReducer } from "../../aar/store/reducers";
import { AARFlowState } from "../../aar/utils/stateUtils";
import {
  persistedSendLoginEngagementReducer,
  type SENDLoginEngagementState
} from "../../loginEngagement/store/reducers";
import {
  PnBannerDismissState,
  persistedPnBannerDismissReducer
} from "../../reminderBanner/reducer/bannerDismiss";
import { getRptIdStringFromPayment } from "../../utils/rptId";
import { toPNMessage } from "../types/transformers";
import { PNMessage } from "../types/types";
import { PnActivationState, pnActivationReducer } from "./activation";
import { state } from "fp-ts";
import { create } from "lodash";

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

const a = {
  kind: "PotSome",
  value: {
    _tag: "Some",
    value: {
      abstract:
        "upliftingly openly eek cannon duh huzzah hence wherever oxidize flustered if enrage hmph valiantly gah inasmuch psst rich since in mid till sunbathe justly if now fidget stable pfft but wrongly after hence worth cellar",
      iun: "SEND-SEND-SEND-000099-A-0",
      isCancelled: false,
      notificationStatusHistory: [
        {
          activeFrom: new Date(),
          relatedTimelineElements: [
            "ZCJjuFAYEnPJEXCG1amTTK3eCQBwmlY0klN5rAfHNR7TrjX7vHJI49YjQu4Cbxbk",
            "jSMmWtt0fUl7X7LXfdRMmdb5rRDoVN51StzvIAyRVB9DieAxtVxaN81PGf5ftyIk"
          ],
          status: "DELIVERING"
        },
        {
          activeFrom: new Date(),
          relatedTimelineElements: [
            "hxiAcLgBw0XWzznHsvmVS16FNI7SSA70QpQQCYxdINTdnpEof5MwxjQEf6vJYtjl",
            "PIkOpv0DLfb0zhqfMKn7YnC30BNDPbk1bLV5PxJ47PGQcvB5Bi1Cwo8i1LXtE4pD"
          ],
          status: "VIEWED"
        },
        {
          activeFrom: new Date(),
          relatedTimelineElements: [
            "awsj9KbFlSxM5lyx7Krpe6NUYiCeAQp0eYFRtjSKiFIOoKihcfHcyHYGsn5Mnv5y",
            "pxmpwfK4yE3Cq0OlzDTpz1Im8vyr5UT1O1FpxUSrmgGNy9KgwwaKAQqhWiWrn9St",
            "rE3mSUhvLDhbrDniv5N0kkXxbyobsRS2nNAoHjaMmhUGkfpSWNThlUQ2wMQEGBrn",
            "1FE1m5eR4SYWQJG0rgSFpVBoiFmTI8Z3EMYrVP9Vo4k2i1LiWYRS7TeB1EfOfYIw",
            "o3nOf1fevBZhTMQsOh0pMKfQZMCNUDT4xZJJqUwRQrBJcK7nfebDOepcPM5ulITv"
          ],
          status: "PAID"
        },
        {
          activeFrom: new Date(),
          relatedTimelineElements: [
            "lyKlMcxKVSb61hSROwnFgEMMhigmyhz0RKHkmTydcJgOZOzsQgzNDlPNGhQcBNbI",
            "snLBVpIbP4LypfEgJv5Ui2eOvCCTw0j1R2qJwk6TYg4xMox9v3v8CubuRMF7Lvas"
          ],
          status: "REFUSED"
        }
      ],
      recipients: [
        {
          denomination: "Volpe, Sucera e Vezzoli Group",
          recipientType: "PF",
          taxId: "RSSMGV80A41H501I"
        }
      ],
      senderDenomination: "Passero e figli",
      subject: "failing roughly well-made coaxingly geez",
      created_at: new Date()
    }
  }
};
const b = {
  kind: "PotSome",
  value: {
    _tag: "Some",
    value: {
      abstract:
        "upliftingly openly eek cannon duh huzzah hence wherever oxidize flustered if enrage hmph valiantly gah inasmuch psst rich since in mid till sunbathe justly if now fidget stable pfft but wrongly after hence worth cellar",
      iun: "SEND-SEND-SEND-000098-A-0",
      isCancelled: false,
      notificationStatusHistory: [
        {
          activeFrom: new Date(),
          relatedTimelineElements: [
            "ZCJjuFAYEnPJEXCG1amTTK3eCQBwmlY0klN5rAfHNR7TrjX7vHJI49YjQu4Cbxbk",
            "jSMmWtt0fUl7X7LXfdRMmdb5rRDoVN51StzvIAyRVB9DieAxtVxaN81PGf5ftyIk"
          ],
          status: "DELIVERING"
        },
        {
          activeFrom: new Date(),
          relatedTimelineElements: [
            "hxiAcLgBw0XWzznHsvmVS16FNI7SSA70QpQQCYxdINTdnpEof5MwxjQEf6vJYtjl",
            "PIkOpv0DLfb0zhqfMKn7YnC30BNDPbk1bLV5PxJ47PGQcvB5Bi1Cwo8i1LXtE4pD"
          ],
          status: "VIEWED"
        },
        {
          activeFrom: new Date(),
          relatedTimelineElements: [
            "awsj9KbFlSxM5lyx7Krpe6NUYiCeAQp0eYFRtjSKiFIOoKihcfHcyHYGsn5Mnv5y",
            "pxmpwfK4yE3Cq0OlzDTpz1Im8vyr5UT1O1FpxUSrmgGNy9KgwwaKAQqhWiWrn9St",
            "rE3mSUhvLDhbrDniv5N0kkXxbyobsRS2nNAoHjaMmhUGkfpSWNThlUQ2wMQEGBrn",
            "1FE1m5eR4SYWQJG0rgSFpVBoiFmTI8Z3EMYrVP9Vo4k2i1LiWYRS7TeB1EfOfYIw",
            "o3nOf1fevBZhTMQsOh0pMKfQZMCNUDT4xZJJqUwRQrBJcK7nfebDOepcPM5ulITv"
          ],
          status: "PAID"
        },
        {
          activeFrom: new Date(),
          relatedTimelineElements: [
            "lyKlMcxKVSb61hSROwnFgEMMhigmyhz0RKHkmTydcJgOZOzsQgzNDlPNGhQcBNbI",
            "snLBVpIbP4LypfEgJv5Ui2eOvCCTw0j1R2qJwk6TYg4xMox9v3v8CubuRMF7Lvas"
          ],
          status: "REFUSED"
        }
      ],
      recipients: [
        {
          denomination: "Volpe, Sucera e Vezzoli Group",
          recipientType: "PF",
          taxId: "RSSMGV80A41H501I"
        }
      ],
      senderDenomination: "Passero e figli",
      subject: "failing roughly well-made coaxingly geez",
      created_at: new Date()
    }
  }
};

export const pnMessageFromIdSelector = createSelector(
  (state: GlobalState, messageId: string) =>
    thirdPartyFromIdSelector(state, messageId),
  thirdPartyMessage => pot.map(thirdPartyMessage, _ => toPNMessage(_))
);

export const testingSelector = (messageId: string) =>
  createSelector(
    (currentState: GlobalState) =>
      thirdPartyFromIdSelector(currentState, messageId),
    data => pot.map(data, _ => toPNMessage(_))
  );

/*
const mySelector= messageFromID(msgId)

useIOSelector(mySelector) 

*/

// export const pnMessageFromIdSelector = createSelector(
// (
//   _state: GlobalState,
//   messageId: string
// ) => messageId,
// messageId=> messageId === "00000000000000000000000006"
//     ? a
//     : messageId === b.value.value.iun
//     ? b
//     : pot.none;
// )

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
