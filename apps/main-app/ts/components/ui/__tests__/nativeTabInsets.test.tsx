import { Body, IOVisualCostants } from "@io-app/design-system";
import { fireEvent } from "@testing-library/react-native";
import { Platform, StyleSheet } from "react-native";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { IOListView } from "../IOListView";
import { IOScrollView, IOScrollViewProps } from "../IOScrollView";

const contentEndMargin = 32;
const actionBlockHeight = 50;

jest.mock("react-native-safe-area-context", () => ({
  ...jest.requireActual<typeof import("react-native-safe-area-context")>(
    "react-native-safe-area-context"
  ),
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 })
}));

const renderComponent = (
  kind: "list" | "scroll",
  props: Omit<IOScrollViewProps, "animatedRef">
) => {
  const state = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    () =>
      kind === "scroll" ? (
        <IOScrollView {...props}>
          <Body>Content</Body>
        </IOScrollView>
      ) : (
        <IOListView
          {...props}
          data={["Content"]}
          keyExtractor={item => item}
          renderItem={({ item }) => <Body>{item}</Body>}
        />
      ),
    ROUTES.WALLET_HOME,
    {},
    configureMockStore<GlobalState>()(state)
  );
};

describe.each(["scroll", "list"] as const)("%s native tab insets", kind => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test.each([
    { name: "home-indicator tab bar", bottomInset: 83 },
    { name: "home-button tab bar", bottomInset: 49 },
    { name: "different native tab bar height", bottomInset: 102 },
    { name: "initial measurement", bottomInset: 0 }
  ])(
    "keeps actions above the $name without double-counting scroll insets",
    ({ bottomInset }) => {
      jest.replaceProperty(Platform, "OS", "ios");
      const { getByTestId } = renderComponent(kind, {
        testID: "inset-content",
        bottomInset,
        contentInsetAdjustmentBehavior: "automatic",
        excludeSafeAreaMargins: true,
        actions: {
          type: "SingleButton",
          primary: { label: "Action", onPress: jest.fn() }
        }
      });

      const scrollView = getByTestId("inset-content");
      const actions = getByTestId("inset-content-actions");
      expect(scrollView.props.contentInsetAdjustmentBehavior).toBe("automatic");
      expect(StyleSheet.flatten(actions.props.style).paddingBottom).toBe(
        bottomInset + IOVisualCostants.appMarginDefault
      );
      expect(
        StyleSheet.flatten(scrollView.props.contentContainerStyle).paddingBottom
      ).toBe(IOVisualCostants.appMarginDefault + contentEndMargin);

      const actionBlock = actions.find(
        node =>
          node.props.pointerEvents === "box-none" &&
          typeof node.props.onLayout === "function"
      );
      fireEvent(actionBlock, "layout", {
        nativeEvent: {
          layout: { x: 0, y: 0, width: 300, height: actionBlockHeight }
        }
      });
      expect(
        StyleSheet.flatten(
          getByTestId("inset-content").props.contentContainerStyle
        ).paddingBottom
      ).toBe(
        IOVisualCostants.appMarginDefault + actionBlockHeight + contentEndMargin
      );
    }
  );

  test.each([
    { name: "iOS", os: "ios" as const, expectedBottomMargin: 34 },
    { name: "Android", os: "android" as const, expectedBottomMargin: 42 }
  ])(
    "preserves non-tab $name spacing without enabling automatic insets",
    ({ os, expectedBottomMargin }) => {
      jest.replaceProperty(Platform, "OS", os);
      const { getByTestId } = renderComponent(kind, {
        testID: "inset-content"
      });
      const scrollView = getByTestId("inset-content");
      expect(scrollView.props.contentInsetAdjustmentBehavior).toBeUndefined();
      expect(
        StyleSheet.flatten(scrollView.props.contentContainerStyle).paddingBottom
      ).toBe(expectedBottomMargin + contentEndMargin);
    }
  );

  it("reserves the native bottom inset manually when automatic adjustment is disabled", () => {
    jest.replaceProperty(Platform, "OS", "ios");
    const bottomInset = 83;
    const { getByTestId } = renderComponent(kind, {
      testID: "inset-content",
      bottomInset,
      contentInsetAdjustmentBehavior: "never"
    });
    expect(
      StyleSheet.flatten(
        getByTestId("inset-content").props.contentContainerStyle
      ).paddingBottom
    ).toBe(bottomInset + IOVisualCostants.appMarginDefault + contentEndMargin);
  });
});
