import { ComponentProps } from "react";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as MSG_DETAILS_HEADER from "../../../messages/components/MessageDetail/MessageDetailsHeader";
import { MessageDetails } from "../MessageDetails";
import PN_ROUTES from "../../navigation/routes";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import { IOReceivedNotification } from "../../../../../definitions/pn/IOReceivedNotification";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";

jest.mock("../MessageCancelledContent");
jest.mock("../MessageDetailsContent");
jest.mock(
  "../../../messages/components/MessageDetail/MessageDetailsAttachments"
);
jest.mock("../MessagePayments");
jest.mock("../F24Section");
jest.mock("../MessageBottomMenu");
jest.mock("../MessageFooter");
jest.mock("../MessagePaymentBottomSheet");

const mockMessageId = "messageId1";
const mockServiceId = "serviceId" as ServiceId;

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
  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("isAARMessage logic", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const attachments = thirdPartyMessage.third_party_message.attachments;
    const createdAt = thirdPartyMessage.created_at;
    const message = thirdPartyMessage.third_party_message
      .details as IOReceivedNotification;
    sendOpeningSources.forEach(sendOpeningSource =>
      sendUserTypes.forEach(sendUserType => {
        it(`should ${
          sendOpeningSource === "aar" ? "" : "NOT"
        } display the message date, opening source ${sendOpeningSource}, user type ${sendUserType}`, () => {
          const headerSpy = jest.spyOn(
            MSG_DETAILS_HEADER,
            "MessageDetailsHeader"
          );
          const messageId =
            sendOpeningSource === "aar" ? message.iun : mockMessageId;
          const props = generateComponentProperties(
            attachments,
            createdAt,
            message,
            messageId,
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
            expect(passedDate).toEqual(createdAt);
          }
        });

        it(`should ${
          sendOpeningSource === "aar" ? "NOT " : ""
        }allow navigation to service details, opening source ${sendOpeningSource}, user type ${sendUserType}`, () => {
          const sendMessage = { iun: "" }; // TODO
          const headerSpy = jest.spyOn(
            MSG_DETAILS_HEADER,
            "MessageDetailsHeader"
          );
          const messageId =
            sendOpeningSource === "aar" ? sendMessage.iun : mockMessageId;
          const props = generateComponentProperties(
            attachments,
            createdAt,
            message,
            messageId,
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
});

const generateComponentProperties = (
  attachments: ReadonlyArray<ThirdPartyAttachment> | undefined,
  createdAt: Date | undefined,
  message: IOReceivedNotification,
  messageId: string,
  serviceId: ServiceId,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): ComponentProps<typeof MessageDetails> => ({
  attachments,
  createdAt,
  message,
  messageId,
  payments,
  serviceId,
  sendOpeningSource,
  sendUserType
});

const renderComponent = (props: ComponentProps<typeof MessageDetails>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
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
