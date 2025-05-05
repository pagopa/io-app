import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { UIMessage } from "../../../types";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { WrappedListItemMessage } from "../WrappedListItemMessage";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  scheduledPreconditionStatusAction,
  toScheduledPayload
} from "../../../store/actions/preconditions";
import { MessageCategory } from "../../../../../../definitions/communications/MessageCategory";

jest.mock("rn-qr-generator", () => ({}));
jest.mock("react-native-screenshot-prevent", () => ({}));

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

jest.mock("./../DS/ListItemMessage");

describe("WrappedListItemMessage", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  [0, 1].forEach(index =>
    (["INBOX", "ARCHIVE", "SEARCH"] as const).forEach(source =>
      (
        [
          {
            tag: "PAYMENT",
            rptId: "00112233445566778899001122334"
          },
          {
            tag: "PAYMENT",
            rptId: "00112233445500000000000000000"
          },
          {
            tag: "LEGAL_MESSAGE"
          },
          {
            tag: "EU_COVID_CERT"
          },
          {
            tag: "GENERIC"
          },
          {
            tag: "PN"
          }
        ] as Array<MessageCategory>
      ).forEach(category =>
        [false, true].forEach(isRead =>
          [false, true].forEach(selectedForArchiviation =>
            it(`should match snapshot for message in ${source}, category ${JSON.stringify(
              category
            )}, read ${isRead}, selected for archiviation/unarchiviation ${selectedForArchiviation}`, () => {
              const message = generateMessage(
                category,
                category.tag === "PN",
                isRead
              );
              const component = renderComponent(
                index,
                message,
                selectedForArchiviation,
                source
              );
              expect(component.toJSON()).toMatchSnapshot();
            })
          )
        )
      )
    )
  );
  it("should trigger navigation to Message Routing when the component is pressed and the message has no preconditions", () => {
    const message = generateMessage(
      { tag: "GENERIC" } as MessageCategory,
      false,
      true
    );
    const component = renderComponent(0, message, false, "INBOX");
    const pressable = component.getByTestId("wrapped_message_list_item_0");
    expect(pressable).toBeDefined();
    fireEvent.press(pressable);
    expect(mockNavigate.mock.calls.length).toBe(1);
    expect(mockNavigate.mock.calls[0][1]).toStrictEqual({
      screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
      params: {
        messageId: message.id,
        fromNotification: false
      }
    });
    expect(mockDispatch.mock.calls.length).toBe(0);
  });
  it("should dispatch 'scheduledPreconditionStatusAction' when the message has preconditions", () => {
    const message = generateMessage(
      { tag: "PN" } as MessageCategory,
      true,
      true
    );
    const component = renderComponent(0, message, false, "INBOX");
    const pressable = component.getByTestId("wrapped_message_list_item_0");
    expect(pressable).toBeDefined();
    fireEvent.press(pressable);
    expect(mockNavigate.mock.calls.length).toBe(0);
    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      scheduledPreconditionStatusAction(
        toScheduledPayload(message.id, message.category.tag)
      )
    );
  });
});

const generateMessage = (
  category: MessageCategory,
  hasPrecondition: boolean,
  isRead: boolean
): UIMessage =>
  ({
    createdAt: new Date(1990, 0, 2, 3, 4),
    isRead,
    organizationName: "Organization name",
    organizationFiscalCode: "RGNFSCCDO",
    serviceId: "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId,
    serviceName: "Service name",
    title: "Message title",
    category,
    hasPrecondition
  } as UIMessage);

const renderComponent = (
  index: number,
  message: UIMessage,
  isArchiving: boolean,
  source: "INBOX" | "ARCHIVE" | "SEARCH"
) => {
  const paymentId: string = "00112233445566778899001122334";
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const stateWithPayment = {
    ...initialState,
    entities: {
      ...initialState.entities,
      messages: {
        ...initialState.entities.messages,
        archiving: {
          ...initialState.entities.messages.archiving,
          status: isArchiving ? "enabled" : "disabled",
          fromInboxToArchive: new Set([message.id]),
          fromArchiveToInbox: new Set()
        }
      },
      paymentByRptId: {
        ...initialState.entities.paymentByRptId,
        [paymentId]: {
          kind: "COMPLETED"
        }
      }
    }
  } as GlobalState;
  const store = createStore(appReducer, stateWithPayment as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <WrappedListItemMessage index={index} message={message} source={source} />
    ),
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
