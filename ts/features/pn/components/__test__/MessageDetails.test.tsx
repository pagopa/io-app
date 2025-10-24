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
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ATTACHMENT_CATEGORY } from "../../../messages/types/attachmentCategory";
import { NotificationRecipient } from "../../../../../definitions/pn/NotificationRecipient";
import { NotificationStatusHistoryElement } from "../../../../../definitions/pn/NotificationStatusHistoryElement";
import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import * as SERVICE_SELECTORS from "../../../services/details/store/selectors";
import * as DETAILS_BY_ID_SELECTORS from "../../../messages/store/reducers/detailsById";
import { PaymentData } from "../../../messages/types";

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

const mockFiscalCode = "NTOLEI25H01B008W";
const mockMessageId = "messageId1";
const mockIUN = "iun1";
const mockServiceId = "serviceId" as ServiceId;

const mockServiceDetails = {
  id: mockServiceId,
  description: "Service description",
  name: "Service name",
  organization: {
    fiscal_code: "Organization Fiscal Code",
    name: "Organization Name"
  }
} as ServiceDetails;

const mockPaymentData = {} as PaymentData;

const attachmentList: ReadonlyArray<ThirdPartyAttachment> = [
  {
    id: "1",
    url: "https://an.url/path/1",
    category: ATTACHMENT_CATEGORY.F24
  } as ThirdPartyAttachment,
  {
    id: "2",
    url: "https://an.url/path/2",
    category: ATTACHMENT_CATEGORY.F24
  } as ThirdPartyAttachment
];

const recipientList: ReadonlyArray<NotificationRecipient> = [
  {
    recipientType: "RT",
    taxId: mockFiscalCode,
    denomination: "Denomination",
    payment: {
      noticeCode: "nc",
      creditorTaxId: "cti"
    }
  } as NotificationRecipient
];

const completedPaymentList: ReadonlyArray<string> = [
  "nc1cti1",
  "nc2cti2",
  "nc3cti3"
];

const timelineList: ReadonlyArray<NotificationStatusHistoryElement> = [
  {
    status: "IN_VALIDATION",
    activeFrom: new Date(),
    relatedTimelineElements: []
  },
  { status: "ACCEPTED", activeFrom: new Date(), relatedTimelineElements: [] }
];

describe("MessageDetails component", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  // eslint-disable-next-line sonarjs/cognitive-complexity
  [false, true].forEach(useEmptyLists =>
    [undefined, false, true].forEach(isCancelled =>
      [undefined, "A Sender"].forEach(senderDenomination =>
        [undefined, "An abstract"].forEach(abstract =>
          [false, true].forEach(isAAR =>
            [false, true].forEach(isDelegate => {
              it(`should match snapshot (attachments ${
                useEmptyLists ? "none" : attachmentList.length
              }, recipients ${
                useEmptyLists ? "none" : recipientList.length
              }, completed payments ${
                useEmptyLists ? "none" : completedPaymentList.length
              }, timeline ${useEmptyLists ? "none" : timelineList.length} is ${
                isCancelled ? "" : "not "
              }cancelled, sender denomination ${senderDenomination}, abstract ${abstract}, is ${
                isAAR ? "" : "not "
              }AAR, is ${isDelegate ? "" : "not "}delegate)`, () => {
                jest
                  .spyOn(SERVICE_SELECTORS, "serviceDetailsByIdSelector")
                  .mockImplementation(() => mockServiceDetails);
                const payments = recipientList
                  ?.filter(recipient => recipient.payment != null)
                  .map(recipient => recipient.payment!);
                jest
                  .spyOn(DETAILS_BY_ID_SELECTORS, "messagePaymentDataSelector")
                  .mockImplementation(() =>
                    payments != null && payments.length > 0
                      ? mockPaymentData
                      : undefined
                  );
                const sendMessage: PNMessage = {
                  created_at: new Date(),
                  iun: mockIUN,
                  notificationStatusHistory: useEmptyLists ? [] : timelineList,
                  recipients: useEmptyLists ? [] : recipientList,
                  subject: "A subject",
                  abstract,
                  attachments: useEmptyLists ? [] : attachmentList,
                  completedPayments: useEmptyLists ? [] : completedPaymentList,
                  isCancelled,
                  senderDenomination
                };
                const messageId = isAAR ? mockIUN : mockMessageId;
                const props = generateComponentProperties(
                  messageId,
                  sendMessage,
                  mockServiceId,
                  isAAR,
                  isDelegate,
                  payments
                );
                const { component } = renderComponent(props);
                expect(component.toJSON()).toMatchSnapshot();
              });
            })
          )
        )
      )
    )
  );

  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("isAARMessage logic", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    [true, false].forEach(isAARMessage => {
      it(`should ${
        isAARMessage ? "" : "NOT"
      } display the message date when isAARMessage is ${isAARMessage}`, () => {
        const pnMessage = pipe(thirdPartyMessage, toPNMessage, O.toUndefined)!;
        const headerSpy = jest.spyOn(
          MSG_DETAILS_HEADER,
          "MessageDetailsHeader"
        );
        const messageId = isAARMessage ? pnMessage.iun : mockMessageId;
        const props = generateComponentProperties(
          messageId,
          pnMessage,
          mockServiceId,
          isAARMessage,
          false
        );
        renderComponent(props);
        const mockCalls = headerSpy.mock.calls[0][0];
        expect(mockCalls).toBeDefined();
        const passedDate = mockCalls.createdAt;

        if (isAARMessage) {
          expect(passedDate).toBeUndefined();
        } else {
          expect(passedDate).toEqual(pnMessage.created_at);
        }
      });

      it(`should ${
        isAARMessage ? "NOT " : ""
      }allow navigation to service details when isAARMessage is ${isAARMessage}`, () => {
        const pnMessage = pipe(thirdPartyMessage, toPNMessage, O.toUndefined)!;
        const headerSpy = jest.spyOn(
          MSG_DETAILS_HEADER,
          "MessageDetailsHeader"
        );
        const messageId = isAARMessage ? pnMessage.iun : mockMessageId;
        const props = generateComponentProperties(
          messageId,
          pnMessage,
          mockServiceId,
          isAARMessage,
          false
        );
        renderComponent(props);
        const mockCalls = headerSpy.mock.calls[0][0];
        expect(mockCalls).toBeDefined();
        const canNavigateToServiceDetails =
          mockCalls.canNavigateToServiceDetails;
        if (isAARMessage) {
          expect(canNavigateToServiceDetails).toBe(false);
        } else {
          expect(canNavigateToServiceDetails).toBe(true);
        }
      });
    });
  });
});

const generateComponentProperties = (
  messageId: string,
  message: PNMessage,
  serviceId: ServiceId,
  isAARMessage: boolean,
  isDelegate: boolean,
  payments?: ReadonlyArray<NotificationPaymentInfo>
): ComponentProps<typeof MessageDetails> => ({
  messageId,
  message,
  payments,
  serviceId,
  isAARMessage,
  isDelegate
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
