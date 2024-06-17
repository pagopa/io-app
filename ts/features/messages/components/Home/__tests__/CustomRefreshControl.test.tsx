import React from "react";
import { createStore } from "redux";
import { ReactTestInstance } from "react-test-renderer";
import { MessageListCategory } from "../../../types/messageListCategory";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as homeUtils from "../homeUtils";
import { reloadAllMessages } from "../../../store/actions";
import { pageSize } from "../../../../../config";
import { CustomRefreshControl } from "../CustomRefreshControl";
import * as allPaginated from "./../../../store/reducers/allPaginated";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("CustomRefreshControl", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should match snapshot", () => {
    const category: MessageListCategory = "INBOX";
    jest
      .spyOn(allPaginated, "shouldShowRefreshControllOnListSelector")
      .mockImplementation((_state, _category) => true);
    const component = renderComponent(category);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should dispatch 'reloadAllMessages.request' when output from 'getReloadAllMessagesActionForRefreshIfAllowed' is not undefined, INBOX", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const expectedAction = reloadAllMessages.request({
      pageSize,
      filter: { getArchived: false }
    });
    jest
      .spyOn(homeUtils, "getReloadAllMessagesActionForRefreshIfAllowed")
      .mockImplementation((_state, category) =>
        category === expectedCategory ? expectedAction : undefined
      );

    const component = renderComponent(expectedCategory);
    const refreshControl = customFindByTestId(
      "custom_refresh_control_inbox",
      component.container
    );
    expect(refreshControl).toBeTruthy();

    refreshControl!.props.onRefresh();

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(expectedAction);
  });
  it("should dispatch 'reloadAllMessages.request' when output from 'getReloadAllMessagesActionForRefreshIfAllowed' is not undefined, ARCHIVE", () => {
    const expectedCategory: MessageListCategory = "ARCHIVE";
    const expectedAction = reloadAllMessages.request({
      pageSize,
      filter: { getArchived: true }
    });
    jest
      .spyOn(homeUtils, "getReloadAllMessagesActionForRefreshIfAllowed")
      .mockImplementation((_state, category) =>
        category === expectedCategory ? expectedAction : undefined
      );

    const component = renderComponent(expectedCategory);
    const refreshControl = customFindByTestId(
      "custom_refresh_control_archive",
      component.container
    );
    expect(refreshControl).toBeTruthy();

    refreshControl!.props.onRefresh();

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(expectedAction);
  });
  it("should not dispatch 'reloadAllMessages.request' when output from 'getReloadAllMessagesActionForRefreshIfAllowed' is undefined", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const unexpectedAction = reloadAllMessages.request({
      pageSize,
      filter: { getArchived: false }
    });
    jest
      .spyOn(homeUtils, "getReloadAllMessagesActionForRefreshIfAllowed")
      .mockImplementation((_state, category) =>
        category === expectedCategory ? undefined : unexpectedAction
      );

    const component = renderComponent(expectedCategory);
    const refreshControl = customFindByTestId(
      "custom_refresh_control_inbox",
      component.container
    );
    expect(refreshControl).toBeTruthy();

    refreshControl!.props.onRefresh();

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
    () => <CustomRefreshControl category={category} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};

const customFindByTestId = (
  inputTestID: string,
  container: string | ReactTestInstance | undefined
): ReactTestInstance | undefined => {
  if (!container || typeof container === "string") {
    return undefined;
  }
  const testID = container?.props?.testID;
  if (testID && inputTestID === testID) {
    return container;
  }
  const children = container.children as Array<string | ReactTestInstance>;
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const searchResult = customFindByTestId(inputTestID, child);
    if (searchResult) {
      return searchResult;
    }
  }
  return undefined;
};
