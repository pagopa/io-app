import { Ref } from "react";
import {
  AccessibilityRole,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import Animated from "react-native-reanimated";

import { useIOTheme, useIOThemeContext } from "../../context";
import { IOBannerBigSpacing, IOBannerRadius } from "../../core";
import { hexToRgba, IOColors } from "../../core/IOColors";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import { IconButton } from "../buttons";
import { VSpacer } from "../layout";
import {
  IOPictogramsBleed,
  IOPictogramSizeScale,
  PictogramBleed
} from "../pictograms";
import { BodySmall, buttonTextFontSize, H6, IOText } from "../typography";

/* Styles */
const sizePictogram: IOPictogramSizeScale = 80;
const closeButtonDistanceFromEdge = 10;
const closeButtonOpacity = 0.6;
const bannerPadding = IOBannerBigSpacing;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "center",
    padding: bannerPadding,
    borderRadius: IOBannerRadius,
    borderCurve: "continuous"
  },
  bleedPictogram: {
    marginRight: -bannerPadding
  },
  closeIconButton: {
    position: "absolute",
    right: closeButtonDistanceFromEdge,
    top: closeButtonDistanceFromEdge,
    opacity: closeButtonOpacity
  }
});

/* Component Types */

export type Banner = BannerActionProps &
  BannerCloseProps &
  BaseBannerProps &
  RequiredBannerProps;

type BannerActionProps =
  | {
      accessibilityRole?: AccessibilityRole;
      action?: never;
      onPress?: never;
    }
  | {
      accessibilityRole?: Extract<AccessibilityRole, "button" | "link">;
      action: string;
      onPress: (event: GestureResponderEvent) => void;
    };
// Banner will display a close button if this event is provided
type BannerCloseProps =
  | {
      labelClose?: never;
      onClose?: never;
    }
  | {
      labelClose?: string;
      onClose?: (event: GestureResponderEvent) => void;
    };
/* Description only */
type BannerPropsDescOnly = { content?: string; title: never };

/* Title + Description */
type BannerPropsTitleAndDesc = { content?: string; title?: string };

/* Title only */
type BannerPropsTitleOnly = { content: never; title?: string };

type BaseBannerProps = WithTestID<{
  accessibilityHint?: string;
  // A11y related props
  accessibilityLabel?: string;
  color: "neutral" | "turquoise";
  pictogramName: IOPictogramsBleed;
  ref?: Ref<View>;
}>;

type RequiredBannerProps =
  | BannerPropsDescOnly
  | BannerPropsTitleAndDesc
  | BannerPropsTitleOnly;

// COMPONENT CONFIGURATION

/* Used to generate automatically the colour variants
in the Design System screen */
export const bannerBackgroundColours: Array<BaseBannerProps["color"]> = [
  "neutral",
  "turquoise"
];

const mapBackgroundColorLightMode: Record<
  NonNullable<BaseBannerProps["color"]>,
  IOColors
> = {
  neutral: "grey-50",
  turquoise: "turquoise-50"
};

const mapBackgroundColorDarkMode: Record<
  NonNullable<BaseBannerProps["color"]>,
  IOColors
> = {
  neutral: "grey-50",
  turquoise: "turquoise-300"
};

export const Banner = ({
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
  accessibilityRole = "button",
  ref: viewRef,
  testID
}: Banner) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("medium");
  const { themeType } = useIOThemeContext();
  const theme = useIOTheme();

  // Dynamic colors
  const colorTitle: IOColors = themeType === "dark" ? "grey-50" : "blueIO-850";
  const colorCloseButton: IconButton["color"] =
    themeType === "dark" ? "contrast" : "neutral";
  const colorMainButton =
    themeType === "dark" ? "blueIO-200" : theme["interactiveElem-default"];

  const dynamicContainerStyles: ViewStyle = {
    backgroundColor:
      themeType === "dark"
        ? hexToRgba(IOColors[mapBackgroundColorDarkMode[color]], 0.1)
        : IOColors[mapBackgroundColorLightMode[color]]
  };

  /* Generates a complete fallbackAccessibilityLabel by concatenating the title, content, and action
   if they are present. */
  const fallbackAccessibilityLabel = [title, content, action]
    .filter(Boolean)
    .join(" ");

  const renderMainBlock = () => (
    <>
      <View
        accessibilityHint={accessibilityHint}
        // A11y related props
        accessibilityLabel={accessibilityLabel ?? fallbackAccessibilityLabel}
        accessibilityRole={action !== undefined ? accessibilityRole : "text"}
        accessible={true}
        style={{ flex: 1, alignSelf: "center", gap: 4 }}
      >
        {title && <H6 color={colorTitle}>{title}</H6>}
        {content && (
          <BodySmall color={theme["textBody-tertiary"]} weight={"Regular"}>
            {content}
          </BodySmall>
        )}
        {action && (
          /* Disable pointer events to avoid
             pressed state on the button */
          <Pressable
            accessibilityElementsHidden
            accessibilityLabel={action}
            accessibilityRole="button"
            accessible={true}
            importantForAccessibility="no-hide-descendants"
            onPress={onPress}
            pointerEvents="none"
          >
            <VSpacer size={8} />
            <IOText
              accessibilityElementsHidden={true}
              // A11y
              accessible={false}
              color={colorMainButton}
              ellipsizeMode="tail"
              importantForAccessibility="no-hide-descendants"
              numberOfLines={1}
              size={buttonTextFontSize}
              weight="Semibold"
            >
              {action}
            </IOText>
          </Pressable>
        )}
      </View>
      <View style={[styles.bleedPictogram, { alignSelf: "center" }]}>
        <PictogramBleed name={pictogramName} size={sizePictogram} />
      </View>
      {onClose && labelClose && (
        <View style={styles.closeIconButton}>
          <IconButton
            accessibilityLabel={labelClose}
            color={colorCloseButton}
            icon="closeSmall"
            onPress={onClose}
          />
        </View>
      )}
    </>
  );

  const PressableButton = () => (
    <Pressable
      accessible={false}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      ref={viewRef}
      testID={testID}
    >
      <Animated.View
        style={[styles.container, dynamicContainerStyles, scaleAnimatedStyle]}
      >
        {renderMainBlock()}
      </Animated.View>
    </Pressable>
  );

  const StaticComponent = () => (
    <View
      // A11y related props
      accessible={false}
      ref={viewRef}
      style={[styles.container, dynamicContainerStyles]}
      testID={testID}
    >
      {renderMainBlock()}
    </View>
  );

  return action ? <PressableButton /> : <StaticComponent />;
};
