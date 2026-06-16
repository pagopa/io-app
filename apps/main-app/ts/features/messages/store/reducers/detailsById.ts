import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";

import _ from "lodash";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  populateStoresWithEphemeralAarMessageData,
  terminateAarFlow
} from "../../../pn/aar/store/actions";
import { clearCache } from "../../../settings/common/store/actions";
import { UIMessageDetails } from "../../types";
import { loadMessageDetails, reloadAllMessages } from "../actions";

/**
 * A list of messages and pagination data.
 */
export type DetailsById = {
  [id: string]: pot.Pot<UIMessageDetails, string>;
};

const INITIAL_STATE: DetailsById = {};

/**
 * A reducer to store all messages details by ID
 */
export const detailsByIdReducer = (
  state: DetailsById = INITIAL_STATE,
  action: Action
): DetailsById => {
  switch (action.type) {
    case getType(loadMessageDetails.request): {
      const { id } = action.payload;
      if (state[id]) {
        return { ...state, [id]: pot.toLoading(state[id]) };
      }
      return { ...state, [action.payload.id]: pot.noneLoading };
    }

    case getType(loadMessageDetails.success):
      return { ...state, [action.payload.id]: pot.some(action.payload) };

    case getType(loadMessageDetails.failure): {
      const { id, error } = action.payload;
      if (state[id]) {
        return {
          ...state,
          [id]: pot.toError(state[id], error.message || "UNKNOWN")
        };
      }
      return {
        ...state,
        [action.payload.id]: pot.noneError(error.message || "UNKNOWN")
      };
    }
    case getType(populateStoresWithEphemeralAarMessageData): {
      const { iun, markdown, pnServiceID, subject } = action.payload;
      const messageData: UIMessageDetails = {
        hasRemoteContent: true,
        hasThirdPartyData: true,
        id: iun,
        markdown,
        serviceId: pnServiceID,
        subject
      };
      return {
        ...state,
        [iun]: pot.some(messageData)
      };
    }
    case getType(terminateAarFlow):
      if (action.payload.messageId === undefined) {
        return state;
      }
      return _.omit(state, action.payload.messageId);

    case getType(clearCache):
    case getType(reloadAllMessages.request):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors

/**
 * Return the message's details, if any.
 * @param state
 * @param id
 */
export const messageDetailsByIdSelector = (
  state: GlobalState,
  id: string
): pot.Pot<UIMessageDetails, string> =>
  state.entities.messages.detailsById[id] ?? pot.none;

export const messagePaymentDataSelector = (state: GlobalState, id: string) =>
  pipe(
    messageDetailsByIdSelector(state, id),
    pot.toOption,
    O.chainNullableK(message => message.paymentData),
    O.toUndefined
  );
