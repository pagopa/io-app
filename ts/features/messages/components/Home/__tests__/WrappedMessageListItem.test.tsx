import React from "react";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { UIMessage } from "../../../types";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { TagEnum as SENDTagEnum } from "../../../../../../definitions/backend/MessageCategoryPN";
import { TagEnum } from "../../../../../../definitions/backend/MessageCategoryPayment";
import { WrappedMessageListItem } from "../WrappedMessageListItem";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

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
  it("should trigger the loadServiceDetail.request when service details are not available", () => {
    const serviceId = "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId;
    const message = messageGenerator(false, false, serviceId);
    renderComponent(message, serviceId, false);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      loadServiceDetail.request(serviceId)
    );
  });
  it("should not trigger the loadServiceDetail.request when service details are available", () => {
    const serviceId = "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId;
    const message = messageGenerator(false, false, serviceId);
    renderComponent(message, serviceId);
    expect(mockDispatch.mock.calls[0]).toBeUndefined();
  });
  it("should match snapshot, not from SEND, unread message", () => {
    const serviceId = "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId;
    const message = messageGenerator(false, false, serviceId);
    const component = renderComponent(message, serviceId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, not from SEND,   read message", () => {
    const serviceId = "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId;
    const message = messageGenerator(false, true, serviceId);
    const component = renderComponent(message, serviceId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot,     from SEND, unread message", () => {
    const serviceId = "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId;
    const message = messageGenerator(true, false, serviceId);
    const component = renderComponent(message, serviceId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot,     from SEND,   read message", () => {
    const serviceId = "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId;
    const message = messageGenerator(true, true, serviceId);
    const component = renderComponent(message, serviceId);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should trigger navigation to Message Routing when the component is pressed", () => {
    const serviceId = "01HYFJYTXYHPJTNKP60MRCYRMV" as ServiceId;
    const message = messageGenerator(false, true, serviceId);
    const component = renderComponent(message, serviceId);
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

const messageGenerator = (
  isFromSend: boolean,
  isRead: boolean,
  serviceId: ServiceId
): UIMessage =>
  ({
    createdAt: new Date(1990, 0, 2, 3, 4),
    isRead,
    organizationName: "Organization name",
    serviceId,
    serviceName: "Service name",
    title: "Message title",
    category: {
      tag: isFromSend ? SENDTagEnum.PN : TagEnum.PAYMENT
    }
  } as UIMessage);

const renderComponent = (
  message: UIMessage,
  serviceId: ServiceId,
  addServiceDetailsToReducer: boolean = true
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const serviceDetailsAvailableTest = appReducer(
    designSystemState,
    loadServiceDetail.success({
      service_id: serviceId,
      department_name: "Dep name",
      organization_fiscal_code: "01223580551",
      organization_name: "Org name",
      service_name: "Serv name",
      version: 1
    } as ServicePublic)
  );
  const store = createStore(
    appReducer,
    (addServiceDetailsToReducer
      ? serviceDetailsAvailableTest
      : designSystemState) as any
  );

  return renderScreenWithNavigationStoreContext(
    () => <WrappedMessageListItem index={0} message={message} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
