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
const closeButtonDistanceFromEdge: number = 10;
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

type BaseBannerProps = WithTestID<{
  ref?: Ref<View>;
  color: "neutral" | "turquoise";
  pictogramName: IOPictogramsBleed;
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
      action: string;
      onPress: (event: GestureResponderEvent) => void;
      accessibilityRole?: Extract<AccessibilityRole, "button" | "link">;
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
        style={{ flex: 1, alignSelf: "center", gap: 4 }}
        accessible={true}
        // A11y related props
        accessibilityLabel={accessibilityLabel ?? fallbackAccessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={action !== undefined ? accessibilityRole : "text"}
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
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            accessible={true}
            accessibilityElementsHidden
            accessibilityLabel={action}
            accessibilityRole="button"
            onPress={onPress}
          >
            <VSpacer size={8} />
            <IOText
              weight="Semibold"
              color={colorMainButton}
              size={buttonTextFontSize}
              numberOfLines={1}
              ellipsizeMode="tail"
              // A11y
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden={true}
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
      accessible={false}
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
      ref={viewRef}
      testID={testID}
      style={[styles.container, dynamicContainerStyles]}
      // A11y related props
      accessible={false}
    >
      {renderMainBlock()}
    </View>
  );

  return action ? <PressableButton /> : <StaticComponent />;
};
