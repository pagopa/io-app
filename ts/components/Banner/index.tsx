import React, { useCallback } from "react";
import {
  AccessibilityRole,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { WithTestID } from "../../types/WithTestID";
// Design System components
import { IOColors } from "../core/variables/IOColors";
import { VSpacer } from "../core/spacer/Spacer";
import { IOStyles } from "../core/variables/IOStyles";
import { IOBannerRadius } from "../core/variables/IOShapes";
import { IOBannerSpacing } from "../core/variables/IOSpacing";
import ButtonLink from "../ui/ButtonLink";
import {
  IOPictogramsBleed,
  IOPictogramSizeScale,
  Pictogram
} from "../core/pictograms";
import { LabelSmall } from "../core/typography/LabelSmall";
import { NewH6 } from "../core/typography/NewH6";
import IconButton from "../ui/IconButton";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";

/* Styles */

const colorTitle: IOColors = "blueIO-850";
const colorContent: IOColors = "grey-700";
const colorCloseButton: IconButton["color"] = "neutral";
const sizePictogramBig: IOPictogramSizeScale = 80;
const sizePictogramSmall: IOPictogramSizeScale = 64;
const closeButtonDistanceFromEdge: number = 4;
const closeButtonOpacity = 0.6;
const IOBannerPadding = IOBannerSpacing;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "center",
    borderRadius: IOBannerRadius,
    padding: IOBannerPadding
  },
  bleedPictogram: {
    marginRight: -IOBannerPadding
  },
  closeIconButton: {
    position: "absolute",
    right: closeButtonDistanceFromEdge,
    top: closeButtonDistanceFromEdge,
    opacity: closeButtonOpacity
  }
});

/* Component Types */

type BaseBannerProps = WithTestID<{
  variant: "big" | "small";
  color: "neutral" | "turquoise";
  pictogramName: IOPictogramsBleed;
  viewRef: React.RefObject<View>;
  // A11y related props
  accessibilityLabel?: string;
  accessibilityHint?: string;
}>;

/* Description only */
type BannerPropsDescOnly = { title: never; content?: string };
/* Title only */
type BannerPropsTitleOnly = { title?: string; content: never };
/* Title + Description */
type BannerPropsTitleAndDesc = { title?: string; content?: string };

type RequiredBannerProps =
  | BannerPropsDescOnly
  | BannerPropsTitleOnly
  | BannerPropsTitleAndDesc;

type BannerActionProps =
  | {
      action?: string;
      onPress: (event: GestureResponderEvent) => void;
      accessibilityRole?: never;
    }
  | {
      action?: never;
      onPress?: never;
      accessibilityRole?: AccessibilityRole;
    };

// Banner will display a close button if this event is provided
type BannerCloseProps =
  | {
      onClose?: (event: GestureResponderEvent) => void;
      labelClose?: string;
    }
  | {
      onClose?: never;
      labelClose?: never;
    };

export type Banner = BaseBannerProps &
  RequiredBannerProps &
  BannerActionProps &
  BannerCloseProps;

// COMPONENT CONFIGURATION

/* Used to generate automatically the colour variants
in the Design System screen */
export const bannerBackgroundColours: Array<BaseBannerProps["color"]> = [
  "neutral",
  "turquoise"
];

const mapBackgroundColor: Record<
  NonNullable<BaseBannerProps["color"]>,
  IOColors
> = {
  neutral: "grey-50",
  turquoise: "turquoise-50"
};

export const Banner = ({
  viewRef,
  variant,
  color,
  pictogramName,
  title,
  content,
  action,
  labelClose,
  onPress,
  onClose,
  accessibilityHint,
  accessibilityLabel,
  testID
}: Banner) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.magnifiedButton?.pressedState;

  // Using a spring-based animation for our interpolations
  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const pressedAnimationStyle = useAnimatedStyle(() => {
    // Link color states to the pressed states

    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  const renderMainBlock = () => (
    <>
      <View style={[IOStyles.flex, IOStyles.selfCenter]}>
        {title && (
          <>
            {/* Once we get 'gap' property, we can get rid of
          these <VSpacer> components */}
            <NewH6 weight="SemiBold" color={colorTitle}>
              {title}
            </NewH6>
            <VSpacer size={4} />
          </>
        )}
        {content && (
          <>
            <LabelSmall color={colorContent} weight={"Regular"}>
              {content}
            </LabelSmall>
            {action && <VSpacer size={8} />}
          </>
        )}
        {action && (
          /* Disable pointer events to avoid
            pressed state on the button */
          <View pointerEvents="none">
            <VSpacer size={4} />
            <ButtonLink color="primary" onPress={onPress} label={action} />
          </View>
        )}
      </View>
      <View style={[styles.bleedPictogram, IOStyles.selfCenter]}>
        <Pictogram
          name={pictogramName}
          size={variant === "big" ? sizePictogramBig : sizePictogramSmall}
        />
      </View>
      {onClose && labelClose && (
        <View style={styles.closeIconButton}>
          <IconButton
            icon="closeSmall"
            color={colorCloseButton}
            onPress={onClose}
            accessibilityLabel={labelClose}
          />
        </View>
      )}
    </>
  );

  const PressableButton = () => (
    <Pressable
      ref={viewRef}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      // A11y related props
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
    >
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: IOColors[mapBackgroundColor[color]] },
          pressedAnimationStyle
        ]}
      >
        {renderMainBlock()}
      </Animated.View>
    </Pressable>
  );

  const StaticComponent = () => (
    <View
      ref={viewRef}
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: IOColors[mapBackgroundColor[color]] }
      ]}
      // A11y related props
      accessible={false}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={"text"}
    >
      {renderMainBlock()}
    </View>
  );

  return action ? <PressableButton /> : <StaticComponent />;
};
