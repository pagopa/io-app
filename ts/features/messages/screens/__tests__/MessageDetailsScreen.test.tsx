import configureMockStore from "redux-mock-store";
import { Action, Store } from "redux";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { GlobalState } from "../../../../store/reducers/types";
import { appReducer } from "../../../../store/reducers";
import { MessageDetailsScreen } from "../MessageDetailsScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { reproduceSequence } from "../../../../utils/tests";
import {
  loadMessageById,
  loadMessageDetails,
  loadThirdPartyMessage
} from "../../../messages/store/actions";
import {
  toUIMessage,
  toUIMessageDetails
} from "../../../messages/store/reducers/transformers";
import {
  messageWithExpairedPayment,
  messageWithValidPayment,
  message_1
} from "../../../messages/__mocks__/message";
import { loadServiceDetail } from "../../../../store/actions/services";
import { service_1 } from "../../../messages/__mocks__/messages";
import { applicationChangeState } from "../../../../store/actions/application";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { ATTACHMENT_CATEGORY } from "../../types/attachmentCategory";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { UIMessageId } from "../../types";

export const thirdPartyMessage: ThirdPartyMessageWithContent = {
  ...message_1,
  created_at: new Date("2020-01-01T00:00:00.000Z"),
  third_party_message: {
    attachments: [
      {
        id: "1",
        name: "A First Attachment",
        content_type: "application/pdf",
        category: ATTACHMENT_CATEGORY.DOCUMENT,
        url: "/resource/attachment1.pdf"
      },
      {
        id: "2",
        name: "A Second Attachment",
        content_type: "application/pdf",
        category: ATTACHMENT_CATEGORY.DOCUMENT,
        url: "/resource/attachment2.pdf"
      }
    ] as Array<ThirdPartyAttachment>
  }
};

describe("MessageDetailsScreen", () => {
  it("should display the attachment tag if there are attachments", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(
        toUIMessageDetails(messageWithExpairedPayment)
      ),
      loadThirdPartyMessage.success({
        id: message_1.id as UIMessageId,
        content: thirdPartyMessage
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const mockStore = configureMockStore<GlobalState>();
    const store: Store<GlobalState> = mockStore(state);

    const { component } = renderComponent(store);
    expect(component.queryByTestId("attachment-tag")).not.toBeNull();
  });

  it("should NOT display the attachment tag if there are no attachments", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(
        toUIMessageDetails(messageWithExpairedPayment)
      ),
      loadThirdPartyMessage.success({
        id: message_1.id as UIMessageId,
        content: {
          ...thirdPartyMessage,
          third_party_message: {
            attachments: []
          }
        }
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const mockStore = configureMockStore<GlobalState>();
    const store: Store<GlobalState> = mockStore(state);

    const { component } = renderComponent(store);
    expect(component.queryByTestId("attachment-tag")).toBeNull();
  });

  it("should display the error tag if the payment is expired", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(toUIMessageDetails(messageWithExpairedPayment))
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const mockStore = configureMockStore<GlobalState>();
    const store: Store<GlobalState> = mockStore(state);

    const { component } = renderComponent(store);
    expect(component.queryByTestId("due-date-tag")).not.toBeNull();
  });

  it("should NOT display the error tag if the payment is valid", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(toUIMessageDetails(messageWithValidPayment))
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const mockStore = configureMockStore<GlobalState>();
    const store: Store<GlobalState> = mockStore(state);

    const { component } = renderComponent(store);
    expect(component.queryByTestId("due-date-tag")).toBeNull();
  });
});

const renderComponent = (store: Store<GlobalState>) => {
  const { id, sender_service_id } = message_1;

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      MessageDetailsScreen,
      MESSAGES_ROUTES.MESSAGE_DETAIL,
      {
        messageId: id,
        serviceId: sender_service_id
      },
      store
    )
  };
};
