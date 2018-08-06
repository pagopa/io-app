/**
 * A reducer to store the messages normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { PaymentData } from "../../../../../definitions/backend/PaymentData";
import { MessageWithContentPO } from "../../../../types/MessageWithContentPO";
import { MESSAGE_LOAD_SUCCESS } from "../../../actions/constants";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

// An object containing MessageWithContentPO keyed by id
export type MessagesByIdState = Readonly<{
  [key: string]: MessageWithContentPO | undefined;
}>;

export type MessageByIdState = Readonly<MessageWithContentPO>;

export type MessageDetailsByIdState = Readonly<{
  id: string;
  createdAt: string;
  markdown?: MessageBodyMarkdown;
  paymentData?: PaymentData;
  serviceName: string;
  serviceOrganizationName: string;
  serviceDepartmentName: string;
  subject?: MessageSubject;
}> | null;

export const INITIAL_STATE: MessagesByIdState = {};

const reducer = (
  state: MessagesByIdState = INITIAL_STATE,
  action: Action
): MessagesByIdState => {
  switch (action.type) {
    /**
     * A new service has been loaded from the Backend. Add the message to the list object.
     */
    case MESSAGE_LOAD_SUCCESS:
      // Use the ID as object key
      return { ...state, [action.payload.id]: { ...action.payload } };

    default:
      return state;
  }
};

// Selectors
export const messagesByIdSelector = (state: GlobalState): MessagesByIdState =>
  state.entities.messages.byId;

export const messageByIdSelector = (id: string) => (
  state: GlobalState
): MessageByIdState | undefined => state.entities.messages.byId[id];

export const messageDetailsByIdSelector = (id: string) => (
  state: GlobalState
): MessageDetailsByIdState | undefined => {
  const message = state.entities.messages.byId[id];

  if (!message) {
    return undefined;
  }

  const service = state.entities.services.byId[message.sender_service_id];

  if (!service) {
    return undefined;
  }

  return {
    id: message.id,
    createdAt: message.created_at,
    markdown: message.markdown,
    paymentData: message.payment_data,
    serviceName: service.service_name,
    serviceOrganizationName: service.organization_name,
    serviceDepartmentName: service.department_name,
    subject: message.subject
  };
};

export default reducer;
