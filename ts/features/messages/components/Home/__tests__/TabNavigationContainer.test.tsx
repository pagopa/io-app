import { createStore } from "redux";
import PagerView from "react-native-pager-view";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { TabNavigationContainer } from "../TabNavigationContainer";
import { MessageListCategory } from "../../../types/messageListCategory";
import { setShownMessageCategoryAction } from "../../../store/actions";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";

describe("TabNavigationContainer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockAccessibilityInfo(false);
  });
  it("should match snapshot when shownCategory is INBOX", () => {
    const screen = renderScreen("INBOX");
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when shownCategory is ARCHIVE", () => {
    const screen = renderScreen("ARCHIVE");
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("when displaying INBOX and ARCHIVE chips is pressed, it should trigger pagerViewRef ", () => {
    const setPageMock = jest.fn();
    const screen = renderScreen("INBOX", setPageMock);
    const archivePressableComponent = screen.getByTestId(
      "home_tab_item_archive"
    );
    expect(archivePressableComponent).toBeDefined();
    fireEvent.press(archivePressableComponent);
    expect(setPageMock.mock.calls[0][0]).toStrictEqual(1);
  });
  it("when displaying INBOX and INBOX chips is pressed, it should NOT trigger pagerViewRef ", () => {
    const setPageMock = jest.fn();
    const screen = renderScreen("INBOX", setPageMock);
    const inboxPressableComponent = screen.getByTestId("home_tab_item_inbox");
    expect(inboxPressableComponent).toBeDefined();
    fireEvent.press(inboxPressableComponent);
    expect(setPageMock.mock.calls[0]).toBeUndefined();
  });
  it("when displaying INBOX and INBOX chips is pressed, it should trigger pagerViewRef ", () => {
    const setPageMock = jest.fn();
    const screen = renderScreen("ARCHIVE", setPageMock);
    const inboxPressableComponent = screen.getByTestId("home_tab_item_inbox");
    expect(inboxPressableComponent).toBeDefined();
    fireEvent.press(inboxPressableComponent);
    expect(setPageMock.mock.calls[0][0]).toStrictEqual(0);
  });
  it("when displaying INBOX and ARCHIVE chips is pressed, it should NOT trigger pagerViewRef ", () => {
    const setPageMock = jest.fn();
    const screen = renderScreen("ARCHIVE", setPageMock);
    const archivePressableComponent = screen.getByTestId(
      "home_tab_item_archive"
    );
    expect(archivePressableComponent).toBeDefined();
    fireEvent.press(archivePressableComponent);
    expect(setPageMock.mock.calls[0]).toBeUndefined();
  });
});

const renderScreen = (
  shownCategory: MessageListCategory,
  setPageMock: jest.Mock<any, any> = jest.fn()
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const finalState = appReducer(
    initialState,
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
