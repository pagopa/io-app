import * as pot from "@pagopa/ts-commons/lib/pot";
import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
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
import { UIAttachmentId, UIMessageDetails, UIMessageId } from "../../types";
import { attachmentFromThirdPartyMessage } from "./transformers";

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

export const isThirdPartyMessageSelector = (
  state: GlobalState,
  ioMessageId: UIMessageId
) =>
  pipe(
    state.entities.messages.thirdPartyById[ioMessageId],
    thirdPartyMessageOrUndefined => !!thirdPartyMessageOrUndefined
  );

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

export const thirdPartyMessageAttachments = (
  state: GlobalState,
  ioMessageId: UIMessageId
) =>
  pipe(
    thirdPartyFromIdSelector(state, ioMessageId),
    pot.toOption,
    O.chainNullableK(
      thirdPartyMessage => thirdPartyMessage.third_party_message.attachments
    ),
    O.getOrElse(
      () => [] as ReadonlyArray<t.TypeOf<typeof ThirdPartyAttachment>>
    )
  );

export const thirdPartyMessageUIAttachment =
  (state: GlobalState) =>
  (ioMessageId: UIMessageId) =>
  (thirdPartyMessageAttachmentId: UIAttachmentId) =>
    pipe(
      thirdPartyFromIdSelector(state, ioMessageId),
      pot.toOption,
      O.chainNullableK(
        thirdPartyMessage => thirdPartyMessage.third_party_message.attachments
      ),
      O.chainNullableK(thirdPartyMessageAttachments =>
        thirdPartyMessageAttachments.find(
          thirdPartyMessageAttachment =>
            thirdPartyMessageAttachment.id ===
            (thirdPartyMessageAttachmentId as string as NonEmptyString)
        )
      ),
      O.map(thirdPartyMessageAttachment =>
        attachmentFromThirdPartyMessage(
          ioMessageId,
          thirdPartyMessageAttachment
        )
      )
    );

const messageContentSelector = <T>(
  state: GlobalState,
  ioMessageId: UIMessageId,
  extractionFunction: (input: RemoteContentDetails | UIMessageDetails) => T
) =>
  pipe(
    state.entities.messages.thirdPartyById[ioMessageId],
    O.fromNullable,
    O.chain(messagePot =>
      pipe(
        messagePot,
        pot.toOption,
        O.chainNullableK(message => message.third_party_message.details),
        O.chain(details =>
          pipe(
            details,
            RemoteContentDetails.decode,
            O.fromEither,
            O.map(extractionFunction)
          )
        )
      )
    ),
    O.toUndefined
  );
