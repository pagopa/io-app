import { Action, Store, createStore } from "redux";
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
import { loadServiceDetail } from "../../../services/details/store/actions/details";
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
    const store: Store<GlobalState> = createStore(appReducer, state as any);

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
    const store: Store<GlobalState> = createStore(appReducer, state as any);

    const { component } = renderComponent(store);
    expect(component.queryByTestId("attachment-tag")).toBeNull();
  });

  it("should display the alert banner if the payment is expiring", () => {
    const next7Days = new Date(new Date().setDate(new Date().getDate() + 7));

    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(
        toUIMessageDetails({
          ...messageWithValidPayment,
          content: {
            ...messageWithValidPayment.content,
            due_date: next7Days
          }
        })
      )
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const store: Store<GlobalState> = createStore(appReducer, state as any);

    const { component } = renderComponent(store);
    expect(component.queryByTestId("due-date-alert")).toBeNull();
  });

  it("should NOT display the alert banner if the payment is NOT expiring", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(toUIMessageDetails(messageWithValidPayment))
    ];

    const state: Partial<GlobalState> = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const store: Store<GlobalState> = createStore(appReducer, state as any);

    const { component } = renderComponent(store);
    expect(component.queryByTestId("due-date-alert")).toBeNull();
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
