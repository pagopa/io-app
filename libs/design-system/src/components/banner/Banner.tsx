import { Ref, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  AccessibilityRole,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import Animated from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IODimensions, IOTypography } from "../../core";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import { IconButton } from "../buttons";
import { VStack } from "../layout";
import { IOPictogramsBleed, PictogramBleed } from "../pictograms";
import { BodySmall, H6, IOText } from "../typography";

/* Styles */
const closeButtonOpacity = 0.6;
const bannerPadding = IODimensions.padding.banner;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "center",
    padding: bannerPadding,
    borderRadius: IODimensions.radius.banner,
    borderCurve: "continuous"
  },
  bleedPictogram: {
    marginRight: -bannerPadding
  },
  closeIconButton: {
    position: "absolute",
    right: IODimensions.offset.banner.close,
    top: IODimensions.offset.banner.close,
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
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    const initialQuery = new AbortController();
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      enabled => {
        initialQuery.abort();
        setScreenReaderEnabled(enabled);
      }
    );
    void AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
      if (!initialQuery.signal.aborted) {
        setScreenReaderEnabled(enabled);
      }
    });

    return () => {
      initialQuery.abort();
      subscription.remove();
    };
  }, []);

  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("medium");
  const bannerColors = useIOColors().component.banner;

  const dynamicContainerStyles: ViewStyle = {
    backgroundColor: bannerColors.background[color]
  };

  const fallbackAccessibilityLabel = [title, content].filter(Boolean).join(" ");

  const renderMainBlock = () => (
    <>
      <View
        style={{
          flex: 1,
          alignSelf: "center",
          gap: IODimensions.gap.banner.description
        }}
      >
        <View
          accessibilityHint={action ? undefined : accessibilityHint}
          accessibilityLabel={accessibilityLabel ?? fallbackAccessibilityLabel}
          accessibilityRole="text"
          accessible={true}
          style={{ gap: IODimensions.gap.banner.description }}
        >
          <VStack space={IODimensions.gap.banner.description}>
            {title && (
              <H6 accessible={false} color={bannerColors.foreground.title}>
                {title}
              </H6>
            )}
            {content && (
              <BodySmall
                accessible={false}
                color={bannerColors.foreground.content}
                weight={"Regular"}
              >
                {content}
              </BodySmall>
            )}
          </VStack>
          {action && (
            /* Disable pointer events to avoid
             pressed state on the button */
            <Pressable
              accessibilityHint={accessibilityHint}
              accessibilityLabel={action}
              accessibilityRole={accessibilityRole}
              accessible={true}
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <IOText
                accessibilityElementsHidden={true}
                // A11y
                accessible={false}
                color={bannerColors.foreground.action}
                ellipsizeMode="tail"
                importantForAccessibility="no-hide-descendants"
                numberOfLines={1}
                size={IOTypography.buttonText.size}
                weight="Semibold"
              >
                {action}
              </IOText>
            </Pressable>
          )}
        </View>
      </View>
      <View style={[styles.bleedPictogram, { alignSelf: "center" }]}>
        <PictogramBleed
          name={pictogramName}
          size={IODimensions.size.pictogram.banner}
        />
      </View>
      {onClose && labelClose && (
        <View style={styles.closeIconButton}>
          <IconButton
            accessibilityLabel={labelClose}
            color={bannerColors.closeButton}
            icon="closeSmall"
            onPress={onClose}
          />
        </View>
      )}
    </>
  );

  const BannerContainer = screenReaderEnabled ? View : Pressable;

  const PressableButton = () => (
    <BannerContainer
      accessible={false}
      focusable={false}
      importantForAccessibility="no"
      onPress={screenReaderEnabled ? undefined : onPress}
      onPressIn={screenReaderEnabled ? undefined : onPressIn}
      onPressOut={screenReaderEnabled ? undefined : onPressOut}
      ref={viewRef}
      testID={testID}
    >
      <Animated.View
        style={[styles.container, dynamicContainerStyles, scaleAnimatedStyle]}
      >
        {renderMainBlock()}
      </Animated.View>
    </BannerContainer>
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
