import {
  Body,
  H6,
  HSpacer,
  IOButton,
  IOColors,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useCallback, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { completeTourAction, prevTourStepAction } from "../store/actions";
import { activeGroupIdSelector } from "../store/selectors";
import { TourItemMeasurement } from "../types";
import { useTourStepNavigation } from "../hooks/useTourStepNavigation";

const TOOLTIP_MARGIN = 16;
const ARROW_SIZE = 10;
const BORDER_RADIUS = 8;

type Props = {
  itemMeasurement: TourItemMeasurement;
  title: string;
  description: string;
  stepIndex: number;
  totalSteps: number;
};

export const TourTooltip = ({
  itemMeasurement,
  title,
  description,
  stepIndex,
  totalSteps
}: Props) => {
  const dispatch = useIODispatch();
  const theme = useIOTheme();
  const groupId = useIOSelector(activeGroupIdSelector);
  const insets = useSafeAreaInsets();
  const tooltipBgColor = IOColors[theme["appBackground-primary"]];
  const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
  const { handleNext } = useTourStepNavigation();

  const [tooltipHeight, setTooltipHeight] = useState(0);

  const spaceAbove = itemMeasurement.y - insets.top;
  const spaceBelow =
    screenHeight - (itemMeasurement.y + itemMeasurement.height) - insets.bottom;

  const showAbove = spaceAbove > spaceBelow;

  const tooltipTop = showAbove
    ? itemMeasurement.y - tooltipHeight - ARROW_SIZE / 2 - TOOLTIP_MARGIN
    : itemMeasurement.y +
      itemMeasurement.height +
      ARROW_SIZE / 2 +
      TOOLTIP_MARGIN;

  const itemCenterX = itemMeasurement.x + itemMeasurement.width / 2;
  const tooltipWidth = screenWidth - TOOLTIP_MARGIN * 2;
  const tooltipLeft = Math.max(
    TOOLTIP_MARGIN,
    Math.min(
      itemCenterX - tooltipWidth / 2,
      screenWidth - tooltipWidth - TOOLTIP_MARGIN
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

  return (
    <View
      style={[
        styles.container,
        { top: tooltipTop, left: tooltipLeft, width: tooltipWidth }
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
              ? { bottom: -ARROW_SIZE / 2 }
              : { top: -ARROW_SIZE / 2 })
          }
        ]}
      />
      <View style={[styles.tooltip, { backgroundColor: tooltipBgColor }]}>
        <H6>{title}</H6>
        <VSpacer size={4} />
        <Body>{description}</Body>
        <VSpacer size={8} />
        <Body weight="Semibold">{`${stepIndex + 1} / ${totalSteps}`}</Body>
        <VSpacer size={16} />
        <View style={styles.buttonsRow}>
          <IOButton
            variant="link"
            color="primary"
            label={I18n.t("features.tour.skip")}
            onPress={handleSkip}
          />
          <View style={styles.rightButtons}>
            {!isFirstStep && (
              <>
                <IOButton
                  variant="link"
                  color="primary"
                  label={I18n.t("features.tour.back")}
                  onPress={handleBack}
                />
                <HSpacer size={8} />
              </>
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
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 10000
  },
  tooltip: {
    borderRadius: BORDER_RADIUS,
    borderCurve: "continuous",
    padding: 16
  },
  arrow: {
    position: "absolute",
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    transform: [{ rotate: "45deg" }],
    zIndex: -1
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center"
  }
});
