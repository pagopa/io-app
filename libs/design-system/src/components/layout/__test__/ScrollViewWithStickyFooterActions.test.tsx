import { act, fireEvent, render, within } from "@testing-library/react-native";
import { View } from "react-native";
import { type Metrics, SafeAreaProvider } from "react-native-safe-area-context";

import { IOSpacing, IOVisualCostants } from "../../../core";
import { ScrollViewWithStickyFooterActions } from "../ScrollViewWithStickyFooterActions";

/* The component and FooterActions read safe-area insets, so every case uses
   deterministic metrics. */
const metrics: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 }
};
const placeholderTestID = "ScrollViewWithStickyFooterActionsPlaceholder";
const endSpacerTestID = "ScrollViewWithStickyFooterActionsEndSpacer";
const dockedActionsTestID = "ScrollViewWithStickyFooterActionsDockedActions";
const scrollViewTestID = "sticky-scroll-view";
const footerTestID = "sticky-footer-actions";
const invisibleButAccessibleOpacity = 0.01;
const actionBlockHeight = 48;
const floatingActionsHeight =
  actionBlockHeight + metrics.insets.bottom + IOSpacing.screenEndMargin;
const placeholderY = 1000;
const scrollViewHeight = 600;
const dockingScrollY = placeholderY - scrollViewHeight + floatingActionsHeight;
const scrollPastDocking = 16;
const scrollFarBeyondContent = 10000;

describe("ScrollViewWithStickyFooterActions", () => {
  afterEach(() => jest.useRealTimers());

  it("renders its slots around the footer placeholder", () => {
    const { getByLabelText, getByTestId } = renderComponent({
      afterPlaceholder: <View testID="after-placeholder" />,
      beforePlaceholder: <View testID="before-placeholder" />,
      footerActionProps: {
        actions: singleButtonActions(),
        testID: footerTestID
      },
      scrollViewProps: {
        scrollEventThrottle: 16,
        testID: scrollViewTestID
      }
    });

    const scrollView = getByTestId(scrollViewTestID);
    const slotTestIDs = [
      "before-placeholder",
      placeholderTestID,
      "after-placeholder",
      endSpacerTestID
    ];
    const renderedSlotTestIDs = scrollView
      .findAll(
        node =>
          typeof node.type === "string" &&
          slotTestIDs.includes(node.props.testID)
      )
      .map(node => node.props.testID);

    expect(scrollView).toHaveProp("scrollEventThrottle", 16);
    expect(renderedSlotTestIDs).toEqual(slotTestIDs);
    expect(getByLabelText("Primary")).toBeTruthy();
    expect(
      getByTestId(footerTestID, { includeHiddenElements: true })
    ).toHaveStyle({ paddingBottom: metrics.insets.bottom });
    expect(getByTestId(endSpacerTestID)).toHaveStyle({
      height: IOSpacing.screenEndMargin + metrics.insets.bottom
    });
  });

  it("renders only the screen-end placeholder when actions are absent", () => {
    const { getByTestId, queryByRole, queryByTestId } = renderComponent();

    expect(queryByTestId(dockedActionsTestID)).toBeNull();
    expect(getByTestId(placeholderTestID)).toHaveStyle({
      height: IOSpacing.screenEndMargin
    });
    expect(getByTestId(endSpacerTestID)).toHaveStyle({
      height: IOSpacing.screenEndMargin + metrics.insets.bottom
    });
    expect(queryByRole("button", { includeHiddenElements: true })).toBeNull();
  });

  it("shows the floating actions until the placeholder is reached, then swaps them with the docked ones", () => {
    jest.useFakeTimers();
    const { dockedActions, floatingActions, scrollTo } =
      renderMeasuredComponent();

    scrollTo(dockingScrollY);
    expect(floatingActions).toHaveAnimatedStyle({ opacity: 1 });
    expect(dockedActions).toHaveAnimatedStyle({
      opacity: invisibleButAccessibleOpacity
    });

    scrollTo(dockingScrollY + scrollPastDocking);
    expect(floatingActions).toHaveAnimatedStyle({ opacity: 0 });
    expect(dockedActions).toHaveAnimatedStyle({ opacity: 1 });

    scrollTo(dockingScrollY);
    expect(floatingActions).toHaveAnimatedStyle({ opacity: 1 });
    expect(dockedActions).toHaveAnimatedStyle({
      opacity: invisibleButAccessibleOpacity
    });
  });

  it("lets touches reach the floating actions only until they're docked", () => {
    jest.useFakeTimers();
    const onPress = jest.fn();
    const { floatingActions, scrollTo } = renderMeasuredComponent(onPress);
    const floatingButton = within(floatingActions).getByLabelText("Primary", {
      includeHiddenElements: true
    });

    fireEvent.press(floatingButton);
    expect(onPress).toHaveBeenCalledTimes(1);

    scrollTo(dockingScrollY + scrollPastDocking);
    fireEvent.press(floatingButton);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("keeps the floating actions until they're measured", () => {
    jest.useFakeTimers();
    const { getByTestId } = renderComponent({
      footerActionProps: {
        actions: singleButtonActions(),
        testID: footerTestID
      },
      scrollViewProps: { testID: scrollViewTestID }
    });

    fireEvent(
      getByTestId(scrollViewTestID),
      "layout",
      layoutEvent(scrollViewHeight)
    );
    act(() => jest.runOnlyPendingTimers());
    fireEvent.scroll(getByTestId(scrollViewTestID), {
      nativeEvent: { contentOffset: { x: 0, y: scrollFarBeyondContent } }
    });

    expect(
      getByTestId(footerTestID, { includeHiddenElements: true })
    ).toHaveAnimatedStyle({ opacity: 1 });
    expect(getByTestId(dockedActionsTestID)).toHaveAnimatedStyle({
      opacity: invisibleButAccessibleOpacity
    });
  });

  it("exposes the docked actions to screen readers, hiding the floating ones", () => {
    const onPress = jest.fn();
    const { getByLabelText, getByTestId } = renderComponent({
      footerActionProps: {
        actions: singleButtonActions(onPress),
        testID: footerTestID
      }
    });

    const dockedActions = getByTestId(dockedActionsTestID);
    const accessibleButton = getByLabelText("Primary");

    expect(getByTestId(placeholderTestID)).toContainElement(dockedActions);
    expect(dockedActions).toContainElement(accessibleButton);
    expect(
      getByTestId(footerTestID, { includeHiddenElements: true })
    ).not.toBeVisible();

    fireEvent.press(accessibleButton);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("leaves a regular margin below the docked actions instead of the safe area", () => {
    const { getByTestId } = renderComponent({
      footerActionProps: { actions: singleButtonActions() }
    });

    expect(getByTestId(dockedActionsTestID)).toHaveStyle({
      marginTop: IOSpacing.screenEndMargin,
      paddingBottom: IOVisualCostants.appMarginDefault
    });
  });

  it("keeps the screen-end margin when there is no bottom safe area", () => {
    const metricsWithoutInsets: Metrics = {
      ...metrics,
      insets: { ...metrics.insets, bottom: 0 }
    };
    const { getByTestId } = renderComponent({}, metricsWithoutInsets);

    expect(getByTestId(endSpacerTestID)).toHaveStyle({
      height: IOSpacing.screenEndMargin
    });
  });
});

const singleButtonActions = (onPress = jest.fn()) =>
  ({
    type: "SingleButton",
    primary: { label: "Primary", onPress }
  }) as const;

const layoutEvent = (height: number, y = 0) => ({
  nativeEvent: {
    layout: { height, width: metrics.frame.width, x: 0, y }
  }
});

const renderMeasuredComponent = (onPress = jest.fn()) => {
  const { getByTestId } = renderComponent({
    footerActionProps: {
      actions: singleButtonActions(onPress),
      testID: footerTestID
    },
    scrollViewProps: { testID: scrollViewTestID }
  });
  const floatingActions = getByTestId(footerTestID, {
    includeHiddenElements: true
  });
  const scrollView = getByTestId(scrollViewTestID);

  fireEvent(scrollView, "layout", layoutEvent(scrollViewHeight));
  fireEvent(
    floatingActions.findByProps({ pointerEvents: "box-none" }),
    "layout",
    layoutEvent(actionBlockHeight)
  );
  fireEvent(
    getByTestId(placeholderTestID),
    "layout",
    layoutEvent(0, placeholderY)
  );
  // Reanimated registers its Jest mapper on a zero-delay timer.
  act(() => jest.runOnlyPendingTimers());

  const scrollTo = (y: number) => {
    fireEvent.scroll(scrollView, {
      nativeEvent: { contentOffset: { x: 0, y } }
    });
    act(() => jest.runOnlyPendingTimers());
  };

  return {
    dockedActions: getByTestId(dockedActionsTestID),
    floatingActions,
    scrollTo
  };
};

const renderComponent = (
  props: Partial<
    React.ComponentProps<typeof ScrollViewWithStickyFooterActions>
  > = {},
  initialMetrics: Metrics = metrics
) =>
  render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ScrollViewWithStickyFooterActions
        afterPlaceholder={<View />}
        beforePlaceholder={<View />}
        footerActionProps={{}}
        {...props}
      />
    </SafeAreaProvider>
  );
