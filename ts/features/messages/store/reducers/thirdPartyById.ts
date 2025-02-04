import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { toUndefinedOptional } from "../../../../utils/pot";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { loadThirdPartyMessage, reloadAllMessages } from "../actions";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import {
  toError,
  toLoading,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../store/reducers/types";
import { RemoteContentDetails } from "../../../../../definitions/backend/RemoteContentDetails";
import { UIMessageDetails, UIMessageId } from "../../types";

export type ThirdPartyById = IndexedById<
  pot.Pot<ThirdPartyMessageWithContent, Error>
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
    case getType(loadThirdPartyMessage.request):
      return toLoading(action.payload.id, state);
    case getType(loadThirdPartyMessage.success):
      return toSome(action.payload.id, state, action.payload.content);
    case getType(loadThirdPartyMessage.failure):
      return toError(action.payload.id, state, action.payload.error);
    case getType(reloadAllMessages.request):
      return initialState;
  }
  return state;
};

/**
 * From UIMessageId to the third party content pot
 */
export const thirdPartyFromIdSelector = (
  state: GlobalState,
  ioMessageId: UIMessageId
) => state.entities.messages.thirdPartyById[ioMessageId] ?? pot.none;

export const messageTitleSelector = (
  state: GlobalState,
  ioMessageId: UIMessageId
) =>
  messageContentSelector(
    state,
    ioMessageId,
    (messageContent: RemoteContentDetails | UIMessageDetails) =>
      messageContent.subject
  );

export const messageMarkdownSelector = (
  state: GlobalState,
  ioMessageId: UIMessageId
) =>
  messageContentSelector(
    state,
    ioMessageId,
    (messageContent: RemoteContentDetails | UIMessageDetails) =>
      messageContent.markdown
  );

export const hasAttachmentsSelector = (
  state: GlobalState,
  ioMessageId: UIMessageId
) => pipe(thirdPartyMessageAttachments(state, ioMessageId), RA.isNonEmpty);

export const thirdPartyMessageAttachments = (
  state: GlobalState,
  ioMessageId: UIMessageId
): ReadonlyArray<ThirdPartyAttachment> =>
  pipe(
    thirdPartyFromIdSelector(state, ioMessageId),
    pot.toOption,
    O.chainNullableK(
      thirdPartyMessage => thirdPartyMessage.third_party_message.attachments
    ),
    O.getOrElse<ReadonlyArray<ThirdPartyAttachment>>(() => RA.empty)
  );

const messageContentSelector = <T>(
  state: GlobalState,
  ioMessageId: UIMessageId,
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

export const extractContentFromMessageSources = <T>(
  extractionFunction: (input: RemoteContentDetails | UIMessageDetails) => T,
  messageDetails: UIMessageDetails | undefined,
  thirdPartyMessage: ThirdPartyMessageWithContent | undefined
): T | undefined => {
  const thirdPartyMessageDetails =
    thirdPartyMessage?.third_party_message.details;
  if (thirdPartyMessageDetails != null) {
    const decodedThirdPartyMessageDetails = RemoteContentDetails.decode(
      thirdPartyMessageDetails
    );
    if (E.isRight(decodedThirdPartyMessageDetails)) {
      return extractionFunction(decodedThirdPartyMessageDetails.right);
    }
  }

  if (messageDetails != null) {
    return extractionFunction(messageDetails);
  }
  return undefined;
};
