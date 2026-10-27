import { NotificationPaymentInfo } from "@io-app/api-types/generated/definitions/pn/NotificationPaymentInfo";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { ComponentProps } from "react";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../store/actions/backendStatus";
import { type Action } from "../../../../store/actions/types";
import { appReducer } from "../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { service_1 } from "../../../messages/__mocks__/messages";
import * as MSG_DETAILS_HEADER from "../../../messages/components/MessageDetail/MessageDetailsHeader";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import PN_ROUTES from "../../navigation/routes";
import { toSENDMessage } from "../../store/types/transformers";
import { PNMessage } from "../../store/types/types";
import { MessageDetails } from "../MessageDetails";

jest.mock("../MessageCancelledContent");
jest.mock("../MessageDetailsContent");
jest.mock(
  "../../../messages/components/MessageDetail/MessageDetailsAttachments"
);
jest.mock("../MessagePayments");
jest.mock("../F24Section");
jest.mock("../MessageBottomMenu");
jest.mock("../MessagePaymentBottomSheet");

const mockMessageId = "messageId1";
const mockServiceId = "serviceId" as ServiceId;
const QUALTRICS_URI = "https://pagopa.qualtrics.com/jfe/form/TEST_FORM";
const SCROLL_VIEW_TEST_ID = "MessageDetailsScrollView";
const PLACEHOLDER_TEST_ID = "ScrollViewWithStickyFooterActionsPlaceholder";
const MESSAGE_SURVEY_BANNER_TEST_ID = "message-survey-banner";
const MESSAGE_BOTTOM_MENU_TEST_ID = "MessageBottomMenu";

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

const sendOpeningSources: ReadonlyArray<SendOpeningSource> = [
  "aar",
  "message",
  "not_set"
];
const sendUserTypes: ReadonlyArray<SendUserType> = [
  "mandatory",
  "not_set",
  "recipient"
];

describe("MessageDetails component", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("isAarMessage logic", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    sendOpeningSources.forEach(sendOpeningSource =>
      sendUserTypes.forEach(sendUserType => {
        it(`should ${
          sendOpeningSource === "aar" ? "" : "NOT"
        } display the message date, opening source ${sendOpeningSource}, user type ${sendUserType}`, () => {
          const sendMessage = toSENDMessage(thirdPartyMessage)!;
          const headerSpy = jest.spyOn(
            MSG_DETAILS_HEADER,
            "MessageDetailsHeader"
          );
          const messageId =
            sendOpeningSource === "aar" ? sendMessage.iun : mockMessageId;
          const props = generateComponentProperties(
            messageId,
            sendMessage,
            mockServiceId,
            sendOpeningSource,
            sendUserType
          );
          renderComponent(props);
          const mockCalls = headerSpy.mock.calls[0][0];
          expect(mockCalls).toBeDefined();
          const passedDate = mockCalls.createdAt;

          if (sendOpeningSource === "aar") {
            expect(passedDate).toBeUndefined();
          } else {
            expect(passedDate).toEqual(sendMessage.created_at);
          }
        });

        it(`should ${
          sendOpeningSource === "aar" ? "NOT " : ""
        }allow navigation to service details, opening source ${sendOpeningSource}, user type ${sendUserType}`, () => {
          const sendMessage = toSENDMessage(thirdPartyMessage)!;
          const headerSpy = jest.spyOn(
            MSG_DETAILS_HEADER,
            "MessageDetailsHeader"
          );
          const messageId =
            sendOpeningSource === "aar" ? sendMessage.iun : mockMessageId;
          const props = generateComponentProperties(
            messageId,
            sendMessage,
            mockServiceId,
            sendOpeningSource,
            sendUserType
          );
          renderComponent(props);
          const mockCalls = headerSpy.mock.calls[0][0];
          expect(mockCalls).toBeDefined();
          const canNavigateToServiceDetails =
            mockCalls.canNavigateToServiceDetails;
          if (sendOpeningSource === "aar") {
            expect(canNavigateToServiceDetails).toBe(false);
          } else {
            expect(canNavigateToServiceDetails).toBe(true);
          }
        });
      })
    );
  });

  const placementScenarios = [
    {
      name: "without the survey banner",
      actions: [],
      expectedTestIDs: [PLACEHOLDER_TEST_ID, MESSAGE_BOTTOM_MENU_TEST_ID]
    },
    {
      name: "with the survey banner",
      actions: [
        backendStatusWithSurveyUri(),
        loadServiceDetail.success(service_1)
      ],
      expectedTestIDs: [
        PLACEHOLDER_TEST_ID,
        MESSAGE_SURVEY_BANNER_TEST_ID,
        MESSAGE_BOTTOM_MENU_TEST_ID
      ]
    }
  ];

  test.each(placementScenarios)(
    "places the sticky footer placeholder before the message bottom menu $name",
    ({ actions, expectedTestIDs }) => {
      const sendMessage = toSENDMessage(thirdPartyMessage)!;
      const props = generateComponentProperties(
        mockMessageId,
        sendMessage,
        service_1.id,
        "message",
        "recipient"
      );
      const { component } = renderComponent(props, actions);
      const scrollView = component.getByTestId(SCROLL_VIEW_TEST_ID);
      const renderedTestIDs = scrollView
        .findAll(node => expectedTestIDs.includes(node.props.testID))
        .map(node => node.props.testID)
        .filter((testID, index, testIDs) => testIDs.indexOf(testID) === index);

      expect(renderedTestIDs).toEqual(expectedTestIDs);
    }
  );
});

const generateComponentProperties = (
  messageId: string,
  message: PNMessage,
  serviceId: ServiceId,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): ComponentProps<typeof MessageDetails> => ({
  messageId,
  message,
  payments,
  serviceId,
  sendOpeningSource,
  sendUserType
});

const renderComponent = (
  props: ComponentProps<typeof MessageDetails>,
  actions: ReadonlyArray<Action> = []
) => {
  const globalState = actions.reduce(
    appReducer,
    appReducer(undefined, applicationChangeState("active"))
  );
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetails {...props} />,
      PN_ROUTES.MESSAGE_DETAILS,
      {},
      store
    ),
    store
  };
};
