import {
  AccessibilityRole,
  GestureResponderEvent,
  StyleSheet,
  View
} from "react-native";
import React from "react";
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
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
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
    }
  | {
      action?: never;
      onPress?: never;
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
  accessible,
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  testID
}: Banner) => (
  <View
    ref={viewRef}
    style={[
      styles.container,
      { backgroundColor: IOColors[mapBackgroundColor[color]] }
    ]}
    testID={testID}
    // A11y related props
    accessible={accessible ?? true}
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
  >
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
        <>
          <VSpacer size={4} />
          <ButtonLink color="primary" onPress={onPress} label={action} />
        </>
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
  </View>
);
