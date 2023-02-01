import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
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
import { getNetworkErrorMessage } from "../../../../utils/errors";
import { Mvl } from "../../types/mvlData";
import { mvlDetailsLoad } from "../actions";

export type MvlByIdState = IndexedById<pot.Pot<Mvl, Error>>;

/**
 * Store the MVL data based on the MVLId used to issue the request
 * @param state
 * @param action
 */
export const mvlByIdReducer = (
  state: MvlByIdState = {},
  action: Action
): MvlByIdState => {
  switch (action.type) {
    case getType(mvlDetailsLoad.request):
      return toLoading(action.payload, state);
    case getType(mvlDetailsLoad.success):
      return toSome(action.payload.id, state, action.payload);
    case getType(mvlDetailsLoad.failure):
      return toError(
        action.payload.id,
        state,
        new Error(getNetworkErrorMessage(action.payload))
      );
  }

  return state;
};

/**
 * From MVLId to Mvl
 */
export const mvlFromIdSelector = createSelector(
  [
    (state: GlobalState) => state.features.mvl.byId,
    (_: GlobalState, id: UIMessageId) => id
  ],
  (byId, id): pot.Pot<Mvl, Error> => byId[id] ?? pot.none
);

export const mvlMessageAttachmentSelector =
  (state: GlobalState) =>
  (messageId: UIMessageId) =>
  (mvlMessageAttachmentId: UIAttachmentId) =>
    pipe(
      mvlFromIdSelector(state, messageId),
      pot.toOption,
      O.map(mvlMessage => mvlMessage.legalMessage.attachments),
      O.chainNullableK(mvlLegalMessageAttachment =>
        mvlLegalMessageAttachment.find(
          mvlMessageAttachment =>
            mvlMessageAttachment.id === mvlMessageAttachmentId
        )
      )
    );
