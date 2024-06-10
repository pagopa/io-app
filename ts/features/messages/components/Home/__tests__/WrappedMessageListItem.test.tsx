import React from "react";
import { createStore } from "redux";
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

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
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
    () => <WrappedMessageListItem message={message} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
