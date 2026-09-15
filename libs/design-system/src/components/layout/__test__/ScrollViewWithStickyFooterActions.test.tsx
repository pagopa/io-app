import { act, fireEvent, render } from "@testing-library/react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { type Metrics, SafeAreaProvider } from "react-native-safe-area-context";

import { IOSpacing } from "../../../core";
import { ScrollViewWithStickyFooterActions } from "../ScrollViewWithStickyFooterActions";

/* The component and FooterActions read safe-area insets, so every case uses
   deterministic metrics. */
const metrics: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 }
};
const placeholderTestID = "ScrollViewWithStickyFooterActionsPlaceholder";
const endSpacerTestID = "ScrollViewWithStickyFooterActionsEndSpacer";
const scrollViewTestID = "sticky-scroll-view";
const footerTestID = "sticky-footer-actions";

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

describe("ScrollViewWithStickyFooterActions", () => {
  afterEach(() => jest.useRealTimers());

  it("renders its slots around the footer placeholder", () => {
    const { getByLabelText, getByTestId } = renderComponent({
      afterPlaceholder: <View testID="after-placeholder" />,
      beforePlaceholder: <View testID="before-placeholder" />,
      footerActionProps: {
        actions: {
          type: "SingleButton",
          primary: { label: "Primary", onPress: jest.fn() }
        },
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
    expect(getByTestId(footerTestID)).toHaveStyle({
      paddingBottom: metrics.insets.bottom
    });
    expect(getByTestId(endSpacerTestID)).toHaveStyle({
      height: IOSpacing.screenEndMargin + metrics.insets.bottom
    });
  });

  it("renders only the screen-end placeholder when actions are absent", () => {
    const onMeasure = jest.fn();
    const { getByTestId, queryByRole } = renderComponent({
      footerActionProps: { onMeasure }
    });

    expect(getByTestId(placeholderTestID)).toHaveStyle({
      height: IOSpacing.screenEndMargin
    });
    expect(getByTestId(endSpacerTestID)).toHaveStyle({
      height: IOSpacing.screenEndMargin + metrics.insets.bottom
    });
    expect(queryByRole("button")).toBeNull();
    expect(onMeasure).toHaveBeenCalledWith({
      actionBlockHeight: 0,
      safeBottomAreaHeight: 32
    });
  });

  it("does not measure absent actions again when an inline callback rerenders", () => {
    const onMeasure = jest.fn();
    const Consumer = () => {
      const [safeBottomAreaHeight, setSafeBottomAreaHeight] = useState(0);
      return (
        <>
          <Text testID="safe-bottom-area-height">{safeBottomAreaHeight}</Text>
          <ScrollViewWithStickyFooterActions
            afterPlaceholder={<View />}
            beforePlaceholder={<View />}
            footerActionProps={{
              onMeasure: measurements => {
                onMeasure(measurements);
                setSafeBottomAreaHeight(measurements.safeBottomAreaHeight);
              }
            }}
          />
        </>
      );
    };
    const { getByTestId } = render(
      <SafeAreaProvider initialMetrics={metrics}>
        <Consumer />
      </SafeAreaProvider>
    );

    expect(getByTestId("safe-bottom-area-height")).toHaveTextContent("32");
    expect(onMeasure).toHaveBeenCalledTimes(1);
  });

  it("keeps the footer fixed until its placeholder and then moves it upward", () => {
    jest.useFakeTimers();
    const actionBlockHeight = 48;
    const scrollViewHeight = 600;
    const placeholderHeight =
      actionBlockHeight + metrics.insets.bottom + IOSpacing.screenEndMargin;
    const placeholderY = 1000;
    const placeholderTopEdge =
      placeholderY - scrollViewHeight + placeholderHeight;
    const { getByTestId } = renderComponent({
      footerActionProps: {
        actions: {
          type: "SingleButton",
          primary: { label: "Primary", onPress: jest.fn() }
        },
        testID: footerTestID
      },
      scrollViewProps: { testID: scrollViewTestID }
    });
    const footer = getByTestId(footerTestID);
    const actionContainer = footer.findByProps({ pointerEvents: "box-none" });
    const placeholder = getByTestId(placeholderTestID);
    const scrollView = getByTestId(scrollViewTestID);

    fireEvent(actionContainer, "layout", layoutEvent(actionBlockHeight));
    fireEvent(scrollView, "layout", layoutEvent(scrollViewHeight));
    fireEvent(
      placeholder,
      "layout",
      layoutEvent(placeholderHeight, placeholderY)
    );
    // Reanimated registers its Jest mapper on a zero-delay timer.
    act(() => jest.runOnlyPendingTimers());

    expect(placeholder).toHaveStyle({ height: placeholderHeight });

    fireEvent.scroll(scrollView, {
      nativeEvent: { contentOffset: { x: 0, y: placeholderTopEdge } }
    });
    expect(footer).toHaveAnimatedStyle({
      transform: [{ translateY: 0 }]
    });

    fireEvent.scroll(scrollView, {
      nativeEvent: { contentOffset: { x: 0, y: placeholderTopEdge + 16 } }
    });
    expect(footer).toHaveAnimatedStyle({
      transform: [{ translateY: -16 }]
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

const layoutEvent = (height: number, y = 0) => ({
  nativeEvent: {
    layout: { height, width: metrics.frame.width, x: 0, y }
  }
});
