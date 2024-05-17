import React from "react";
import { createStore } from "redux";
import PagerView from "react-native-pager-view";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { TabNavigationContainer } from "../TabNavigationContainer";
import { MessageListCategory } from "../../../types/messageListCategory";
import {
  reloadAllMessages,
  setShownMessageCategoryAction
} from "../../../store/actions";
import { pageSize } from "../../../../../config";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("TabNavigationContainer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should match snapshot when shownCategory is INBOX", () => {
    const screen = renderScreen("INBOX");
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when shownCategory is ARCHIVE", () => {
    const screen = renderScreen("ARCHIVE");
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("when displaying INBOX, pot.none inbox, should dispatch reloadAllMessages.request", () => {
    renderScreen("INBOX");
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: false }
      })
    );
  });
  it("when displaying INBOX and ARCHIVE chips is pressed, it should dispatch setShownMessageCategoryAction and trigger pagerViewRef ", () => {
    const setPageMock = jest.fn();
    const screen = renderScreen("INBOX", setPageMock);
    const archivePressableComponent = screen.getByTestId(
      "home_tab_item_archive"
    );
    expect(archivePressableComponent).toBeDefined();
    fireEvent.press(archivePressableComponent);
    expect(mockDispatch.mock.calls[1][0]).toStrictEqual(
      setShownMessageCategoryAction("ARCHIVE")
    );
    expect(setPageMock.mock.calls[0][0]).toStrictEqual(1);
  });
  it("when displaying INBOX and INBOX chips is pressed, it should NOT dispatch setShownMessageCategoryAction and NOT trigger pagerViewRef ", () => {
    const setPageMock = jest.fn();
    const screen = renderScreen("INBOX", setPageMock);
    const inboxPressableComponent = screen.getByTestId("home_tab_item_inbox");
    expect(inboxPressableComponent).toBeDefined();
    fireEvent.press(inboxPressableComponent);
    expect(mockDispatch.mock.calls[1]).toBeUndefined();
    expect(setPageMock.mock.calls[0]).toBeUndefined();
  });
  it("when displaying ARCHIVE, pot.none archive, should dispatch reloadAllMessages.request", () => {
    renderScreen("ARCHIVE");
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: true }
      })
    );
  });
  it("when displaying INBOX and INBOX chips is pressed, it should dispatch setShownMessageCategoryAction and trigger pagerViewRef ", () => {
    const setPageMock = jest.fn();
    const screen = renderScreen("ARCHIVE", setPageMock);
    const inboxPressableComponent = screen.getByTestId("home_tab_item_inbox");
    expect(inboxPressableComponent).toBeDefined();
    fireEvent.press(inboxPressableComponent);
    expect(mockDispatch.mock.calls[1][0]).toStrictEqual(
      setShownMessageCategoryAction("INBOX")
    );
    expect(setPageMock.mock.calls[0][0]).toStrictEqual(0);
  });
  it("when displaying INBOX and ARCHIVE chips is pressed, it should NOT dispatch setShownMessageCategoryAction and NOT trigger pagerViewRef ", () => {
    const setPageMock = jest.fn();
    const screen = renderScreen("ARCHIVE", setPageMock);
    const archivePressableComponent = screen.getByTestId(
      "home_tab_item_archive"
    );
    expect(archivePressableComponent).toBeDefined();
    fireEvent.press(archivePressableComponent);
    expect(mockDispatch.mock.calls[1]).toBeUndefined();
    expect(setPageMock.mock.calls[0]).toBeUndefined();
  });
});

const renderScreen = (
  shownCategory: MessageListCategory,
  setPageMock: jest.Mock<any, any> = jest.fn()
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const finalState = appReducer(
    designSystemState,
    setShownMessageCategoryAction(shownCategory)
  );
  const store = createStore(appReducer, finalState as any);

  const mockPaferViewRef = {
    current: {
      setPage: (_: number) => setPageMock(_)
    } as PagerView
  };

  return renderScreenWithNavigationStoreContext(
    () => <TabNavigationContainer pagerViewRef={mockPaferViewRef} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
