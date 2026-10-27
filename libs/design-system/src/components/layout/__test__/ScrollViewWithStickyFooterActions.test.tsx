import { act, fireEvent, render } from "@testing-library/react-native";
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
const singleButtonActions = {
  type: "SingleButton",
  primary: { label: "Primary", onPress: jest.fn() }
} as const;
/* Mirrors the opacity the component gives the docked actions while the sticky
   footer covers them. */
const hiddenDockedActionsOpacity = 0.01;
const scrollViewHeight = 600;
const scrollPastDocking = 16;
const scrollFarBeyondContent = 10000;

describe("ScrollViewWithStickyFooterActions", () => {
  afterEach(() => jest.useRealTimers());

  it("renders its slots around the footer placeholder", () => {
    const { getByLabelText, getByTestId } = renderComponent({
      afterPlaceholder: <View testID="after-placeholder" />,
      beforePlaceholder: <View testID="before-placeholder" />,
      footerActionProps: { actions: singleButtonActions, testID: footerTestID },
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
    ).toHaveStyle({
      paddingBottom: metrics.insets.bottom
    });
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
    expect(queryByRole("button")).toBeNull();
  });

  it("keeps the footer fixed until its placeholder and then swaps it with the docked actions", () => {
    jest.useFakeTimers();
    const actionBlockHeight = 48;
    const stickyFooterHeight =
      actionBlockHeight + metrics.insets.bottom + IOSpacing.screenEndMargin;
    const placeholderY = 1000;
    const dockingScrollY = placeholderY - scrollViewHeight + stickyFooterHeight;
    const { footer, dockedActions, placeholder, scrollView } =
      renderMeasuredComponent();

    fireEvent(scrollView, "layout", layoutEvent(scrollViewHeight));
    fireEvent(
      footer.findByProps({ pointerEvents: "box-none" }),
      "layout",
      layoutEvent(actionBlockHeight)
    );
    fireEvent(placeholder, "layout", layoutEvent(0, placeholderY));
    // Reanimated registers its Jest mapper on a zero-delay timer.
    act(() => jest.runOnlyPendingTimers());

    scrollTo(scrollView, dockingScrollY);
    expect(footer).toHaveAnimatedStyle({
      opacity: 1,
      transform: [{ translateY: 0 }]
    });
    expect(dockedActions).toHaveAnimatedStyle({
      opacity: hiddenDockedActionsOpacity
    });

    scrollTo(scrollView, dockingScrollY + scrollPastDocking);
    expect(footer).toHaveAnimatedStyle({
      opacity: 0,
      transform: [{ translateY: stickyFooterHeight }]
    });
    expect(dockedActions).toHaveAnimatedStyle({ opacity: 1 });
  });

  it("keeps the footer fixed until it's measured", () => {
    jest.useFakeTimers();
    const { footer, dockedActions, scrollView } = renderMeasuredComponent();

    fireEvent(scrollView, "layout", layoutEvent(scrollViewHeight));
    act(() => jest.runOnlyPendingTimers());
    scrollTo(scrollView, scrollFarBeyondContent);

    expect(footer).toHaveAnimatedStyle({
      opacity: 1,
      transform: [{ translateY: 0 }]
    });
    expect(dockedActions).toHaveAnimatedStyle({
      opacity: hiddenDockedActionsOpacity
    });
  });

  it("exposes the docked actions to screen readers, hiding the sticky footer", () => {
    const onPress = jest.fn();
    const { getByLabelText, getByTestId } = renderComponent({
      footerActionProps: {
        actions: {
          type: "SingleButton",
          primary: { label: "Primary", onPress }
        },
        testID: footerTestID
      }
    });

    const placeholder = getByTestId(placeholderTestID);
    const dockedActions = getByTestId(dockedActionsTestID);
    const accessibleButton = getByLabelText("Primary");

    expect(placeholder).toContainElement(dockedActions);
    expect(dockedActions).toContainElement(accessibleButton);
    expect(
      getByTestId(footerTestID, { includeHiddenElements: true })
    ).not.toBeVisible();

    fireEvent.press(accessibleButton);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("leaves a regular margin below the docked actions instead of the safe area", () => {
    const { getByTestId } = renderComponent({
      footerActionProps: { actions: singleButtonActions }
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

const renderMeasuredComponent = () => {
  const { getByTestId } = renderComponent({
    footerActionProps: { actions: singleButtonActions, testID: footerTestID },
    scrollViewProps: { testID: scrollViewTestID }
  });
  return {
    dockedActions: getByTestId(dockedActionsTestID),
    footer: getByTestId(footerTestID, { includeHiddenElements: true }),
    placeholder: getByTestId(placeholderTestID),
    scrollView: getByTestId(scrollViewTestID)
  };
};

const layoutEvent = (height: number, y = 0) => ({
  nativeEvent: {
    layout: { height, width: metrics.frame.width, x: 0, y }
  }
});

const scrollTo = (
  scrollView: ReturnType<typeof renderMeasuredComponent>["scrollView"],
  y: number
) =>
  fireEvent.scroll(scrollView, {
    nativeEvent: { contentOffset: { x: 0, y } }
  });

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
