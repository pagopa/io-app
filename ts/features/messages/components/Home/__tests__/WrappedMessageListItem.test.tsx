import React from "react";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { UIMessage } from "../../../types";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { TagEnum as SENDTagEnum } from "../../../../../../definitions/backend/MessageCategoryPN";
import { TagEnum } from "../../../../../../definitions/backend/MessageCategoryPayment";
import { WrappedMessageListItem } from "../WrappedMessageListItem";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

describe("WrappedMessageListItem", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should match snapshot, not from SEND, unread message", () => {
    const message = messageGenerator(false, false);
    const component = renderComponent(message);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, not from SEND,   read message", () => {
    const message = messageGenerator(false, true);
    const component = renderComponent(message);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot,     from SEND, unread message", () => {
    const message = messageGenerator(true, false);
    const component = renderComponent(message);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot,     from SEND,   read message", () => {
    const message = messageGenerator(true, true);
    const component = renderComponent(message);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should trigger navigation to Message Routing when the component is pressed", () => {
    const message = messageGenerator(false, true);
    const component = renderComponent(message);
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
  });
});

const messageGenerator = (isFromSend: boolean, isRead: boolean): UIMessage =>
  ({
    createdAt: new Date(1990, 0, 2, 3, 4),
    isRead,
    organizationName: "Organization name",
    organizationFiscalCode: "RGNFSCCDO",
    serviceId: "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId,
    serviceName: "Service name",
    title: "Message title",
    category: {
      tag: isFromSend ? SENDTagEnum.PN : TagEnum.PAYMENT
    }
  } as UIMessage);

const renderComponent = (message: UIMessage) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);
  return renderScreenWithNavigationStoreContext(
    () => <WrappedMessageListItem index={0} message={message} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
