/**
 * A component to render the screen content header. It can include:
 * - an image, displayed on the right of the title
 * - a subtitle, displayed below the title
 */
import * as React from "react";
import {
  View,
  Animated,
  ImageSourcePropType,
  StyleSheet,
  Platform
} from "react-native";
import {
  IOColors,
  IOIcons,
  IOPictograms,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import ScreenHeader from "../ScreenHeader";
import { H1 } from "../../components/core/typography/H1";

import variables from "../../theme/variables";
import { Body } from "../core/typography/Body";

type Props = Readonly<{
  title?: string;
  rasterIcon?: ImageSourcePropType;
  icon?: IOIcons;
  pictogram?: IOPictograms;
  subtitle?: string;
  subtitleLink?: JSX.Element;
  dark?: boolean;
  dynamicHeight?: Animated.AnimatedInterpolation<number>;
  // Specified if a custom component is needed, if both icon and rightComponent are defined rightComponent
  // will be rendered in place of icon
  rightComponent?: React.ReactElement;
}>;

const styles = StyleSheet.create({
  subheaderContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  darkGrayBg: {
    backgroundColor: IOColors.bluegrey
  }
});

const shouldCollapse = 1 as unknown as Animated.AnimatedInterpolation<number>;
const shouldExpand = 0 as unknown as Animated.AnimatedInterpolation<number>;

export const ScreenContentHeader = ({
  title,
  subtitle,
  subtitleLink,
  dynamicHeight,
  dark,
  rasterIcon,
  icon,
  pictogram,
  rightComponent
}: Props) => {
  const insets = useSafeAreaInsets();

  // Moved from legacy `constants.ts` file
  // The entire logic is moved to use `useSafeAreaInsets` hook
  const HEADER_HEIGHT =
    variables.appHeaderHeight +
    (Platform.OS === "ios"
      ? insets.top !== 0
        ? 18
        : insets.top
      : variables.spacerHeight);

  const HEADER_ANIMATION_DURATION = 200;

  const heightAnimation = new Animated.Value(HEADER_HEIGHT);

  const elapse = Animated.timing(heightAnimation, {
    useNativeDriver: false,
    toValue: HEADER_HEIGHT,
    duration: HEADER_ANIMATION_DURATION
  });

  const collapse = Animated.timing(heightAnimation, {
    useNativeDriver: false,
    toValue: 0,
    duration: HEADER_ANIMATION_DURATION
  });

  useEffect(() => {
    if (dynamicHeight !== undefined) {
      if (dynamicHeight === shouldCollapse) {
        elapse.stop();
        collapse.start();
      }
      if (dynamicHeight === shouldExpand) {
        collapse.stop();
        elapse.start();
      }
    }
  }, [collapse, dynamicHeight, elapse]);

  return (
    <View style={dark && styles.darkGrayBg}>
      <Animated.View
        style={
          dynamicHeight !== undefined && {
            height: heightAnimation
          }
        }
      >
        <VSpacer size={16} />
        <ScreenHeader
          heading={
            <H1
              accessible={true}
              accessibilityRole="header"
              weight="Bold"
              testID={"screen-content-header-title"}
              color={dark ? "white" : "bluegreyDark"}
            >
              {title}
            </H1>
          }
          rasterIcon={rasterIcon}
          icon={icon}
          pictogram={pictogram}
          dark={dark}
          rightComponent={rightComponent}
        />
        {subtitle && (
          <View style={styles.subheaderContainer}>
            <Body testID={"screen-content-header-subtitle"}>{subtitle}</Body>
            {subtitleLink}
            <VSpacer size={24} />
          </View>
        )}
      </Animated.View>
    </View>
  );
};
