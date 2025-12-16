import { AccessibilityInfo } from "react-native";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { UIMessage } from "../../../types";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { WrappedListItemMessage } from "../WrappedListItemMessage";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  scheduledPreconditionStatusAction,
  toScheduledPayload
} from "../../../store/actions/preconditions";
import { MessageCategory } from "../../../../../../definitions/backend/MessageCategory";
import { toggleScheduledMessageArchivingAction } from "../../../store/actions/archiving";
import * as homeUtils from "../homeUtils";

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

// eslint-disable-next-line functional/no-let
let mockIsAndroid = true;
jest.mock("../../../../../utils/platform", () => ({
  get isAndroid() {
    return mockIsAndroid;
  }
}));

describe("WrappedListItemMessage", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
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
  const commonAccessibilityTestCode = (
    isAndroid: boolean,
    screenReaderEnabled: boolean | undefined,
    shouldAnnounce: boolean,
    isLongTap: boolean
  ) => {
    mockIsAndroid = isAndroid;
    const mockAccessibilityLabelForMessageItem = jest
      .spyOn(homeUtils, "accessibilityLabelForMessageItem")
      .mockImplementation(() => "Mock announcement");
    const mockedAnnounceForAccessibility = jest
      .spyOn(AccessibilityInfo, "announceForAccessibility")
      .mockImplementation(jest.fn());
    const message = generateMessage(
      { tag: "GENERIC" } as MessageCategory,
      false,
      false
    );
    const component = renderComponent(
      0,
      message,
      true,
      "INBOX",
      screenReaderEnabled
    );

    const pressable = component.getByTestId("wrapped_message_list_item_0");
    if (isLongTap) {
      fireEvent(pressable, "onLongPress");
    } else {
      fireEvent.press(pressable);
    }

    if (shouldAnnounce) {
      expect(mockAccessibilityLabelForMessageItem.mock.calls.length).toBe(2);
      expect(mockAccessibilityLabelForMessageItem.mock.calls[0].length).toBe(3);
      expect(mockAccessibilityLabelForMessageItem.mock.calls[1][0]).toEqual(
        message
      );
      expect(mockAccessibilityLabelForMessageItem.mock.calls[1][1]).toBe(
        "INBOX"
      );
      expect(mockAccessibilityLabelForMessageItem.mock.calls[1][2]).toBe(false);

      expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(1);
      expect(mockedAnnounceForAccessibility.mock.calls[0].length).toBe(1);
      expect(mockedAnnounceForAccessibility.mock.calls[0][0]).toBe(
        "Mock announcement"
      );
    } else {
      expect(mockAccessibilityLabelForMessageItem.mock.calls.length).toBe(1);

      expect(mockedAnnounceForAccessibility.mock.calls.length).toBe(0);
    }

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0].length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toEqual(
      toggleScheduledMessageArchivingAction({
        messageId: message.id,
        fromInboxToArchive: true
      })
    );
  };
  [false, true].forEach(isAndroid =>
    [undefined, false, true].forEach(screenReaderEnabled => {
      it(`should ${
        screenReaderEnabled ? "" : "not "
      }announce accessibility and dispatch a toggle action, when long pressing a message on ${
        isAndroid ? "Android" : "iOS"
      }`, () =>
        commonAccessibilityTestCode(
          isAndroid,
          screenReaderEnabled,
          !!screenReaderEnabled,
          true
        ));
      it(`should ${
        screenReaderEnabled && isAndroid ? "" : "not "
      }announce accessibility and dispatch a toggle action, when tapping a message on ${
        isAndroid ? "Android" : "iOS"
      }`, () =>
        commonAccessibilityTestCode(
          isAndroid,
          screenReaderEnabled,
          !!screenReaderEnabled && isAndroid,
          false
        ));
    })
  );
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
  source: "INBOX" | "ARCHIVE" | "SEARCH",
  screenReaderEnabled: boolean = false
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
    },
    preferences: {
      ...initialState.preferences,
      screenReaderEnabled
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
