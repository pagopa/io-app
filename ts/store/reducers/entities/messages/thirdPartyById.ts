import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { loadThirdPartyMessage } from "../../../../features/messages/store/actions";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import {
  UIAttachmentId,
  UIMessageId
} from "../../../../store/reducers/entities/messages/types";
import {
  toError,
  toLoading,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../store/reducers/types";
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
      return toLoading(action.payload, state);
    case getType(loadThirdPartyMessage.success):
      return toSome(action.payload.id, state, action.payload.content);
    case getType(loadThirdPartyMessage.failure):
      return toError(action.payload.id, state, action.payload.error);
  }
  return state;
};

const thirdPartyKeyValueContainer = (state: GlobalState) =>
  state.entities.messages.thirdPartyById;

/**
 * From UIMessageId to the third party content pot
 */
export const thirdPartyFromIdSelector = createSelector(
  [
    thirdPartyKeyValueContainer,
    (_: GlobalState, ioMessageId: UIMessageId) => ioMessageId
  ],
  (
    thirdPartyKeyValueContainer,
    ioMessageId
  ): pot.Pot<ThirdPartyMessageWithContent, Error> =>
    thirdPartyKeyValueContainer[ioMessageId] ?? pot.none
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
          thirdPartyMessageAttachment,
          "GENERIC"
        )
      )
    );
