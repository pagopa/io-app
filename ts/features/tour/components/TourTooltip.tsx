import {
  Body,
  H6,
  IconButton,
  IOButton,
  hexToRgba,
  IOColors,
  HStack,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { completeTourAction, prevTourStepAction } from "../store/actions";
import { activeGroupIdSelector } from "../store/selectors";
import { TourItemMeasurement } from "../types";
import { useTourStepNavigation } from "../hooks/useTourStepNavigation";
import { TourStepIndicator } from "./TourStepIndicator";

const TOOLTIP_MARGIN = 16;
const ARROW_SIZE = 20;
const ARROW_VISIBLE = ARROW_SIZE / 3;
const BORDER_RADIUS = 8;
const CLOSE_BUTTON_SPACE_FROM_EDGE = 8;
const CLOSE_BUTTON_OPACITY = 0.7;
/* Avoid text overlap of title with close icon */
const TOOLTIP_TITLE_SAFE_PADDING = 32;

type Props = {
  itemMeasurement: TourItemMeasurement;
  title: string;
  description: string;
  stepIndex: number;
  totalSteps: number;
  opacity: SharedValue<number>;
};

export const TourTooltip = ({
  itemMeasurement,
  title,
  description,
  stepIndex,
  totalSteps,
  opacity
}: Props) => {
  const dispatch = useIODispatch();
  const theme = useIOTheme();
  const groupId = useIOSelector(activeGroupIdSelector);
  const insets = useSafeAreaInsets();
  const tooltipBgColor = IOColors[theme["appBackground-primary"]];
  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  const { handleNext } = useTourStepNavigation();

  const [tooltipHeight, setTooltipHeight] = useState(0);

  const spaceAbove = itemMeasurement.y - insets.top;
  const spaceBelow =
    windowHeight - (itemMeasurement.y + itemMeasurement.height) - insets.bottom;

  const showAbove = spaceAbove > spaceBelow;

  const rawTooltipTop = showAbove
    ? itemMeasurement.y - tooltipHeight - ARROW_VISIBLE - TOOLTIP_MARGIN
    : itemMeasurement.y +
      itemMeasurement.height +
      ARROW_VISIBLE +
      TOOLTIP_MARGIN;

  const tooltipTop = Math.max(
    insets.top + TOOLTIP_MARGIN,
    Math.min(
      rawTooltipTop,
      windowHeight - insets.bottom - tooltipHeight - TOOLTIP_MARGIN
    )
  );

  const itemCenterX = itemMeasurement.x + itemMeasurement.width / 2;
  const tooltipWidth = windowWidth - TOOLTIP_MARGIN * 2;
  const tooltipLeft = Math.max(
    TOOLTIP_MARGIN,
    Math.min(
      itemCenterX - tooltipWidth / 2,
      windowWidth - tooltipWidth - TOOLTIP_MARGIN
    )
  );

  const arrowLeft = Math.max(
    TOOLTIP_MARGIN + ARROW_SIZE,
    Math.min(
      itemCenterX - tooltipLeft - ARROW_SIZE / 2,
      tooltipWidth - ARROW_SIZE * 2
    )
  );

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const handleSkip = useCallback(() => {
    if (groupId) {
      dispatch(completeTourAction({ groupId }));
    }
  }, [dispatch, groupId]);

  const handleBack = useCallback(() => {
    dispatch(prevTourStepAction());
  }, [dispatch]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { top: tooltipTop, left: tooltipLeft, width: tooltipWidth },
        animatedStyle
      ]}
      onLayout={e => setTooltipHeight(e.nativeEvent.layout.height)}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.arrow,
          {
            backgroundColor: tooltipBgColor,
            left: arrowLeft,
            ...(showAbove
              ? { bottom: -ARROW_VISIBLE }
              : { top: -ARROW_VISIBLE })
          }
        ]}
      />
      <View style={[styles.tooltip, { backgroundColor: tooltipBgColor }]}>
        <VStack space={16}>
          <VStack space={4}>
            <H6 style={{ paddingRight: TOOLTIP_TITLE_SAFE_PADDING }}>
              {title}
            </H6>
            <Body>{description}</Body>
          </VStack>
          <HStack
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <TourStepIndicator stepIndex={stepIndex} totalSteps={totalSteps} />
            <HStack space={8} style={{ alignItems: "center" }}>
              {!isFirstStep && (
                <IOButton
                  variant="link"
                  color="primary"
                  label={I18n.t("features.tour.back")}
                  onPress={handleBack}
                />
              )}
              <IOButton
                variant="link"
                color="primary"
                label={
                  isLastStep
                    ? I18n.t("features.tour.done")
                    : I18n.t("features.tour.next")
                }
                onPress={handleNext}
              />
            </HStack>
          </HStack>
        </VStack>
        <View style={styles.closeIconButton}>
          <IconButton
            icon="closeSmall"
            color="neutral"
            accessibilityLabel={I18n.t("features.tour.skip")}
            onPress={handleSkip}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 100
  },
  tooltip: {
    borderRadius: BORDER_RADIUS,
    borderCurve: "continuous",
    boxShadow: `0px 2px 8px ${hexToRgba(IOColors.black, 0.15)}`,
    padding: 16
  },
  closeIconButton: {
    position: "absolute",
    right: CLOSE_BUTTON_SPACE_FROM_EDGE,
    top: CLOSE_BUTTON_SPACE_FROM_EDGE,
    opacity: CLOSE_BUTTON_OPACITY
  },
  arrow: {
    position: "absolute",
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderRadius: 4,
    borderCurve: "continuous",
    transform: [{ rotate: "45deg" }],
    zIndex: 2
  }
});
