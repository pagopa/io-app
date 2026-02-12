import {
  Body,
  H6,
  HSpacer,
  IOButton,
  IOColors,
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
const ARROW_SIZE = 8;
const TRANSPARENT = "transparent";

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
  const groupId = useIOSelector(activeGroupIdSelector);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
  const { handleNext } = useTourStepNavigation();

  const [tooltipHeight, setTooltipHeight] = useState(0);

  const spaceAbove = itemMeasurement.y - insets.top;
  const spaceBelow =
    screenHeight - (itemMeasurement.y + itemMeasurement.height) - insets.bottom;

  const showAbove = spaceAbove > spaceBelow;

  const tooltipTop = showAbove
    ? itemMeasurement.y - tooltipHeight - ARROW_SIZE - TOOLTIP_MARGIN
    : itemMeasurement.y + itemMeasurement.height + ARROW_SIZE + TOOLTIP_MARGIN;

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
      itemCenterX - tooltipLeft - ARROW_SIZE,
      tooltipWidth - ARROW_SIZE * 3
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
      {showAbove && <View style={[styles.arrowDown, { left: arrowLeft }]} />}
      {!showAbove && (
        <View style={[styles.arrowUp, { left: arrowLeft, top: -ARROW_SIZE }]} />
      )}
      <View style={styles.tooltip}>
        <H6 color="white">{title}</H6>
        <VSpacer size={4} />
        <Body color="white">{description}</Body>
        <VSpacer size={8} />
        <Body color="white" weight="Semibold">
          {`${stepIndex + 1} / ${totalSteps}`}
        </Body>
        <VSpacer size={16} />
        <View style={styles.buttonsRow}>
          <IOButton
            variant="link"
            color="contrast"
            label={I18n.t("features.tour.skip")}
            onPress={handleSkip}
          />
          <View style={styles.rightButtons}>
            {!isFirstStep && (
              <>
                <IOButton
                  variant="link"
                  color="contrast"
                  label={I18n.t("features.tour.back")}
                  onPress={handleBack}
                />
                <HSpacer size={8} />
              </>
            )}
            <IOButton
              variant="solid"
              color="contrast"
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
    backgroundColor: IOColors["blueIO-850"],
    borderRadius: 8,
    padding: 16
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center"
  },
  arrowUp: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: TRANSPARENT,
    borderRightColor: TRANSPARENT,
    borderBottomColor: IOColors["blueIO-850"],
    zIndex: 10001
  },
  arrowDown: {
    position: "absolute",
    bottom: -ARROW_SIZE,
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
    borderLeftColor: TRANSPARENT,
    borderRightColor: TRANSPARENT,
    borderTopColor: IOColors["blueIO-850"],
    zIndex: 10001
  }
});
