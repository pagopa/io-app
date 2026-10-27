import { ThirdPartyAttachment } from "@io-app/api-types/generated/definitions/communication/ThirdPartyAttachment";
import { ThirdPartyMessageWithContent } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessageWithContent";
import { Action, createStore, Store } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../store/actions/backendStatus";
import { appReducer } from "../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { reproduceSequence } from "../../../../utils/tests";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import {
  message_1,
  messageWithExpiredPayment,
  messageWithValidPayment
} from "../../../messages/__mocks__/message";
import { service_1 } from "../../../messages/__mocks__/messages";
import {
  loadMessageById,
  loadMessageDetails,
  loadThirdPartyMessage
} from "../../../messages/store/actions";
import {
  toUIMessage,
  toUIMessageDetails
} from "../../../messages/store/reducers/transformers";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { ATTACHMENT_CATEGORY } from "../../types/attachmentCategory";
import { MessageDetailsScreen } from "../MessageDetailsScreen";

jest.mock("../../components/MessageDetail/MessageDetailsAttachments");

const QUALTRICS_URI = "https://pagopa.qualtrics.com/jfe/form/TEST_FORM";
const SCROLL_VIEW_TEST_ID = "MessageDetailsScrollView";
const PLACEHOLDER_TEST_ID = "ScrollViewWithStickyFooterActionsPlaceholder";
const REMOTE_CONTENT_BANNER_TEST_ID = "remote-content-banner";
const MESSAGE_SURVEY_BANNER_TEST_ID = "message-survey-banner";
const MESSAGE_FOOTER_TEST_ID = "show-more-data-action";

const backendStatusWithSurveyUri = () =>
  backendStatusLoadSuccess({
    ...baseRawBackendStatus,
    config: {
      ...baseRawBackendStatus.config,
      messages_feedback_banner: {
        feedback_uri: QUALTRICS_URI,
        min_app_version: {
          android: "0.0.1",
          ios: "0.0.1"
        }
      }
    }
  });

const thirdPartyMessage: ThirdPartyMessageWithContent = {
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
      loadMessageDetails.success(toUIMessageDetails(messageWithExpiredPayment)),
      loadThirdPartyMessage.success({
        id: message_1.id,
        content: { kind: "TPM", ...thirdPartyMessage }
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
      loadMessageDetails.success(toUIMessageDetails(messageWithExpiredPayment)),
      loadThirdPartyMessage.success({
        id: message_1.id,
        content: {
          kind: "TPM",
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

  it("should display the alert banner if the message's due date is expiring", () => {
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
    expect(component.queryByTestId("due-date-alert")).toBeDefined();
  });

  it("should NOT display the alert banner if the message's due date is NOT expiring", () => {
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

  const placementScenarios = [
    {
      name: "without banners",
      hasRemoteContent: false,
      remoteConfigActions: [],
      expectedTestIDs: [PLACEHOLDER_TEST_ID, MESSAGE_FOOTER_TEST_ID]
    },
    {
      name: "with the remote content and survey banners",
      hasRemoteContent: true,
      remoteConfigActions: [backendStatusWithSurveyUri()],
      expectedTestIDs: [
        PLACEHOLDER_TEST_ID,
        REMOTE_CONTENT_BANNER_TEST_ID,
        MESSAGE_SURVEY_BANNER_TEST_ID,
        MESSAGE_FOOTER_TEST_ID
      ]
    }
  ];

  test.each(placementScenarios)(
    "places the sticky footer placeholder before the message footer $name",
    ({ expectedTestIDs, hasRemoteContent, remoteConfigActions }) => {
      const state = reproduceSequence(
        appReducer(undefined, applicationChangeState("active")),
        appReducer,
        [
          ...remoteConfigActions,
          loadMessageById.success(toUIMessage(message_1)),
          loadServiceDetail.success(service_1),
          loadMessageDetails.success({
            ...toUIMessageDetails(messageWithValidPayment),
            hasRemoteContent
          })
        ]
      );
      const store: Store<GlobalState> = createStore(appReducer, state as any);
      const { component } = renderComponent(store);
      const scrollView = component.getByTestId(SCROLL_VIEW_TEST_ID);
      const renderedTestIDs = scrollView
        .findAll(node => expectedTestIDs.includes(node.props.testID))
        .map(node => node.props.testID)
        .filter((testID, index, testIDs) => testIDs.indexOf(testID) === index);

      expect(renderedTestIDs).toEqual(expectedTestIDs);
    }
  );
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
