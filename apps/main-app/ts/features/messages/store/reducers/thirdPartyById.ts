import * as pot from "@pagopa/ts-commons/lib/pot";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import _ from "lodash";
import { getType } from "typesafe-actions";

import { HasPreconditionEnum } from "../../../../../definitions/communication/HasPrecondition";
import { RemoteContentDetails } from "../../../../../definitions/communication/RemoteContentDetails";
import { ThirdPartyAttachment } from "../../../../../definitions/communication/ThirdPartyAttachment";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import {
  toError,
  toLoading,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../store/reducers/types";
import { isTestEnv } from "../../../../utils/environment";
import { toUndefinedOptional } from "../../../../utils/pot";
import {
  populateStoresWithEphemeralAarMessageData,
  terminateAarFlow
} from "../../../pn/aar/store/actions";
import { UIMessageDetails } from "../../types";
import { ThirdPartyMessageUnion } from "../../types/thirdPartyById";
import { extractContentFromMessageSources } from "../../utils";
import { loadThirdPartyMessage, reloadAllMessages } from "../actions";

export type ThirdPartyById = IndexedById<
  pot.Pot<ThirdPartyMessageUnion, Error>
>;

export const initialState: ThirdPartyById = {};

/**
 * Store third party message content
 * @param state
 * @param action
 */
export const thirdPartyByIdReducer = (
  state: ThirdPartyById = initialState,
  action: Action
): ThirdPartyById => {
  switch (action.type) {
    case getType(loadThirdPartyMessage.failure):
      return toError(action.payload.id, state, action.payload.error);
    case getType(loadThirdPartyMessage.request):
      return toLoading(action.payload.id, state);
    case getType(loadThirdPartyMessage.success):
      return toSome(action.payload.id, state, action.payload.content);
    case getType(populateStoresWithEphemeralAarMessageData):
      const {
        iun,
        pnServiceID,
        subject,
        mandateId,
        thirdPartyMessage,
        markdown,
        fiscalCode
      } = action.payload;

      const ephemeralMessage: ThirdPartyMessageUnion = {
        kind: "AAR",
        mandateId,
        created_at: new Date(),
        third_party_message: thirdPartyMessage,
        id: iun,
        fiscal_code: fiscalCode as FiscalCode,
        sender_service_id: pnServiceID,
        content: {
          third_party_data: {
            has_attachments: true,
            has_precondition: HasPreconditionEnum.NEVER,
            id: iun
          },
          markdown,
          subject
        }
      };
      return toSome(iun, state, ephemeralMessage);
    case getType(reloadAllMessages.request):
      return initialState;

    case getType(terminateAarFlow):
      if (action.payload.messageId === undefined) {
        return state;
      }
      return _.omit(state, action.payload.messageId);
  }
  return state;
};

export const thirdPartyFromIdSelector = (
  state: GlobalState,
  ioMessageId: string
) => state.entities.messages.thirdPartyById[ioMessageId] ?? pot.none;

export const thirdPartyMessageSelector = (
  state: GlobalState,
  ioMessageId: string
) => {
  const thirdPartyMessagePot = thirdPartyFromIdSelector(state, ioMessageId);
  return pot.toUndefined(thirdPartyMessagePot);
};

export const messageTitleSelector = (state: GlobalState, ioMessageId: string) =>
  messageContentSelector(
    state,
    ioMessageId,
    (messageContent: RemoteContentDetails | UIMessageDetails) =>
      messageContent.subject
  );

export const messageMarkdownSelector = (
  state: GlobalState,
  ioMessageId: string
) =>
  messageContentSelector(
    state,
    ioMessageId,
    (messageContent: RemoteContentDetails | UIMessageDetails) =>
      messageContent.markdown
  );

export const hasAttachmentsSelector = (
  state: GlobalState,
  ioMessageId: string
) => thirdPartyMessageAttachmentsSelector(state, ioMessageId).length > 0;

export const thirdPartyMessageAttachmentsSelector = (
  state: GlobalState,
  ioMessageId: string
): ReadonlyArray<ThirdPartyAttachment> => {
  const messagePot = thirdPartyFromIdSelector(state, ioMessageId);
  const attachments =
    pot.toUndefined(messagePot)?.third_party_message.attachments;
  return attachments ?? [];
};

const messageContentSelector = <T>(
  state: GlobalState,
  ioMessageId: string,
  extractionFunction: (input: RemoteContentDetails | UIMessageDetails) => T
) => {
  const messageDetails = toUndefinedOptional(
    state.entities.messages.detailsById[ioMessageId]
  );
  const thirdPartyMessage = toUndefinedOptional(
    state.entities.messages.thirdPartyById[ioMessageId]
  );
  return extractContentFromMessageSources(
    extractionFunction,
    messageDetails,
    thirdPartyMessage
  );
};

export const testable = isTestEnv
  ? {
      messageContentSelector
    }
  : undefined;
