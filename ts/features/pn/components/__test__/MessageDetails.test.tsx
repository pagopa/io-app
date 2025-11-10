import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ComponentProps } from "react";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as MSG_DETAILS_HEADER from "../../../messages/components/MessageDetail/MessageDetailsHeader";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import { toPNMessage } from "../../store/types/transformers";
import { PNMessage } from "../../store/types/types";
import { MessageDetails } from "../MessageDetails";
import PN_ROUTES from "../../navigation/routes";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

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
    sendOpeningSources.forEach(sendOpeningSource =>
      sendUserTypes.forEach(sendUserType => {
        it(`should ${
          sendOpeningSource === "aar" ? "" : "NOT"
        } display the message date, opening source ${sendOpeningSource}, user type ${sendUserType}`, () => {
          const pnMessage = pipe(
            thirdPartyMessage,
            toPNMessage,
            O.toUndefined
          )!;
          const headerSpy = jest.spyOn(
            MSG_DETAILS_HEADER,
            "MessageDetailsHeader"
          );
          const messageId =
            sendOpeningSource === "aar" ? pnMessage.iun : mockMessageId;
          const props = generateComponentProperties(
            messageId,
            pnMessage,
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
            expect(passedDate).toEqual(pnMessage.created_at);
          }
        });

        it(`should ${
          sendOpeningSource === "aar" ? "NOT " : ""
        }allow navigation to service details, opening source ${sendOpeningSource}, user type ${sendUserType}`, () => {
          const pnMessage = pipe(
            thirdPartyMessage,
            toPNMessage,
            O.toUndefined
          )!;
          const headerSpy = jest.spyOn(
            MSG_DETAILS_HEADER,
            "MessageDetailsHeader"
          );
          const messageId =
            sendOpeningSource === "aar" ? pnMessage.iun : mockMessageId;
          const props = generateComponentProperties(
            messageId,
            pnMessage,
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
