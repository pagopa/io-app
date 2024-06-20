import React from "react";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { MessageList } from "../MessageList";
import { MessageListCategory } from "../../../types/messageListCategory";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as homeUtils from "../homeUtils";
import { loadNextPageMessages } from "../../../store/actions";
import { pageSize } from "../../../../../config";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("MessageList", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should dispatch 'loadNextPageMessages.request' when output from 'getLoadNextPageMessagesActionIfNeeded' is not undefined", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const expectedAction = loadNextPageMessages.request({
      pageSize,
      cursor: "01J0B4PFPP24MBX6K8ZYQXXBDW",
      filter: { getArchived: true }
    });
    jest
      .spyOn(homeUtils, "getLoadNextPageMessagesActionIfNeeded")
      .mockImplementation((_state, category, _messageListDistanceFromEnd) =>
        category === expectedCategory ? expectedAction : undefined
      );

    const component = renderComponent(expectedCategory);
    const messageList = component.getByTestId("message_list_inbox");
    expect(messageList).toBeTruthy();

    fireEvent(messageList, "endReached", { distanceFromEnd: 0 });

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(expectedAction);
  });
  it("should not dispatch 'loadNextPageMessages.request' when output from 'getLoadNextPageMessagesActionIfNeeded' is undefined", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const expectedAction = loadNextPageMessages.request({
      pageSize,
      cursor: "01J0B4PFPP24MBX6K8ZYQXXBDW",
      filter: { getArchived: true }
    });
    jest
      .spyOn(homeUtils, "getLoadNextPageMessagesActionIfNeeded")
      .mockImplementation((_state, category, _messageListDistanceFromEnd) =>
        category === expectedCategory ? undefined : expectedAction
      );

    const component = renderComponent(expectedCategory);
    const messageList = component.getByTestId("message_list_inbox");
    expect(messageList).toBeTruthy();

    fireEvent(messageList, "endReached", { distanceFromEnd: 0 });

    expect(mockDispatch.mock.calls.length).toBe(0);
  });
});

const renderComponent = (category: MessageListCategory) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => <MessageList category={category} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
