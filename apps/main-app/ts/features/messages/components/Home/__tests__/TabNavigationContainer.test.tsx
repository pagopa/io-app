import { cleanup, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { MessageListCategory } from "../../../types/messageListCategory";
import { messageListCategoryToViewPageIndex } from "../homeUtils";
import { TabNavigationContainer } from "../TabNavigationContainer";

describe("TabNavigationContainer", () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ["queueMicrotask", "setImmediate"] });
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockAccessibilityInfo(false);
  });
  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  test.each<MessageListCategory>(["INBOX", "ARCHIVE"])(
    "should match snapshot when currentCategory is %s",
    category => {
      const { screen } = renderScreen(category);
      expect(screen.toJSON()).toMatchSnapshot();
    }
  );
  test.each<{
    currentCategory: MessageListCategory;
    expectedCategory: MessageListCategory;
    pressedTab: "archive" | "inbox";
  }>([
    {
      currentCategory: "INBOX",
      pressedTab: "archive",
      expectedCategory: "ARCHIVE"
    },
    {
      currentCategory: "ARCHIVE",
      pressedTab: "inbox",
      expectedCategory: "INBOX"
    },
    { currentCategory: "INBOX", pressedTab: "inbox", expectedCategory: "INBOX" }
  ])(
    "calls onTabPressed with the $pressedTab tab index when current is $currentCategory",
    ({ currentCategory, pressedTab, expectedCategory }) => {
      const { screen, onTabPressed } = renderScreen(currentCategory);

      fireEvent.press(screen.getByTestId(`home_tab_item_${pressedTab}`));

      expect(onTabPressed).toHaveBeenCalledTimes(1);
      expect(onTabPressed).toHaveBeenCalledWith(
        messageListCategoryToViewPageIndex(expectedCategory)
      );
    }
  );
});

const renderScreen = (currentCategory: MessageListCategory) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const onTabPressed = jest.fn();

  return {
    screen: renderScreenWithNavigationStoreContext(
      () => (
        <TabNavigationContainer
          currentCategory={currentCategory}
          onTabPressed={onTabPressed}
        />
      ),
      MESSAGES_ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    onTabPressed
  };
};
