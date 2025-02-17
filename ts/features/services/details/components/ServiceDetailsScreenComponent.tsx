import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  IOColors,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { ComponentProps, ReactNode, useState } from "react";

import {
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View
} from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { ServiceSpecialAction } from "./ServiceSpecialAction";

const scrollTriggerOffsetValue: number = 88;

const HEADER_BG_COLOR: IOColors = "white";

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  },
  gradientBottomActions: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    justifyContent: "flex-end"
  },
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flexShrink: 0
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject
  }
});

const { colors, locations } = easeGradient({
  colorStops: {
    0: { color: hexToRgba(IOColors[HEADER_BG_COLOR], 0) },
    1: { color: IOColors[HEADER_BG_COLOR] }
  },
  easing: Easing.ease,
  extraColorStopsPerTransition: 20
});

/* Extended gradient area above the actions */
const gradientSafeAreaHeight: IOSpacingScale = 96;
/* End content margin before the actions */
const contentEndMargin: IOSpacingScale = 32;
/* Margin between ButtonSolid and ButtonOutline */
const spaceBetweenActions: IOSpacer = 8;
/* Margin between ButtonSolid and ButtonLink */
const spaceBetweenActionAndLink: IOSpacer = 16;
/* Extra bottom margin for iPhone bottom handle because
   ButtonLink doesn't have a fixed height */
const extraSafeAreaMargin: IOSpacingScale = 8;

type PrimaryAction =
  | ({
      type: "StandardCta";
    } & Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">)
  | ({
      type: "SpecialCta";
    } & ComponentProps<typeof ServiceSpecialAction>);

export type ServiceActionsProps =
  | {
      type: "SingleCta";
      primaryActionProps: PrimaryAction;
      secondaryActionProps?: never;
      tertiaryActionProps?: never;
    }
  | {
      type: "TwoCtas";
      primaryActionProps: PrimaryAction;
      secondaryActionProps: Omit<ComponentProps<typeof ButtonLink>, "color">;
      tertiaryActionProps?: never;
    }
  | {
      type: "ThreeCtas";
      primaryActionProps: PrimaryAction;
      secondaryActionProps: Omit<
        ComponentProps<typeof ButtonOutline>,
        "fullWidth" | "color"
      >;
      tertiaryActionProps: Omit<ComponentProps<typeof ButtonLink>, "color">;
    };

type ServiceDetailsScreenComponentProps = {
  children: ReactNode;
  actionsProps?: ServiceActionsProps;
  debugMode?: boolean;
  title?: string;
};

export const ServiceDetailsScreenComponent = ({
  children,
  actionsProps,
  debugMode = false,
  title = ""
}: ServiceDetailsScreenComponentProps) => {
  const theme = useIOTheme();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);

  const getActionBlockHeight = (event: LayoutChangeEvent) => {
    setActionBlockHeight(event.nativeEvent.layout.height);
  };

  const insets = useSafeAreaInsets();
  const needSafeAreaMargin = insets.bottom !== 0;

  const bottomMargin = !needSafeAreaMargin
    ? IOVisualCostants.appMarginDefault
    : insets.bottom;

  /* When the secondary action is visible, add extra margin
       to avoid little space from iPhone bottom handle */
  const extraBottomMargin =
    actionsProps?.secondaryActionProps && needSafeAreaMargin
      ? extraSafeAreaMargin
      : 0;

  /* Safe background block. Cover at least 85% of the space
        to avoid glitchy elements underneath */
  const safeBackgroundBlockHeight = (bottomMargin + actionBlockHeight) * 0.85;

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight =
    bottomMargin + actionBlockHeight + gradientSafeAreaHeight;

  /* Height of the safe bottom area, applied to the ScrollView:
        Actions + Content end margin */
  const safeBottomAreaHeight =
    bottomMargin + actionBlockHeight + contentEndMargin;

  useHeaderSecondLevel({
    backgroundColor: IOColors[theme["appBackground-secondary"]],
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    title
  });

  const footerGradientOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(gradientOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = contentOffset.y;
  });

  return (
    <>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContentContainer,
          {
            paddingBottom: actionsProps
              ? safeBottomAreaHeight
              : bottomMargin + contentEndMargin
          }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToOffsets={[0, scrollTriggerOffsetValue]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        {children}
      </Animated.ScrollView>
      {actionsProps && (
        <View
          style={[
            styles.gradientBottomActions,
            {
              height: gradientAreaHeight,
              paddingBottom: bottomMargin
            }
          ]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.gradientContainer,
              debugMode && {
                borderTopColor: IOColors["error-500"],
                borderTopWidth: 1,
                backgroundColor: hexToRgba(IOColors["error-500"], 0.5)
              },
              footerGradientOpacityTransition
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              style={{
                height: gradientAreaHeight - safeBackgroundBlockHeight
              }}
              locations={locations}
              colors={colors}
            />
            <View
              style={{
                bottom: 0,
                height: safeBackgroundBlockHeight,
                backgroundColor: HEADER_BG_COLOR
              }}
            />
          </Animated.View>
          <View
            style={styles.buttonContainer}
            pointerEvents="box-none"
            onLayout={getActionBlockHeight}
          >
            {renderActions(actionsProps, extraBottomMargin)}
          </View>
        </View>
      )}
    </>
  );
};

const renderActions = (
  actions: ServiceActionsProps,
  extraBottomMargin: number = 0
) => {
  const {
    type,
    primaryActionProps,
    secondaryActionProps,
    tertiaryActionProps
  } = actions;

  return (
    <>
      {primaryActionProps.type === "StandardCta" ? (
        <ButtonSolid fullWidth {...primaryActionProps} />
      ) : (
        <ServiceSpecialAction {...primaryActionProps} />
      )}

      {type === "TwoCtas" && (
        <View
          style={{
            alignSelf: "center",
            marginBottom: extraBottomMargin
          }}
        >
          <VSpacer size={spaceBetweenActionAndLink} />
          <ButtonLink color="primary" {...secondaryActionProps} />
        </View>
      )}

      {type === "ThreeCtas" && (
        <>
          <VSpacer size={spaceBetweenActions} />
          <ButtonOutline fullWidth color="primary" {...secondaryActionProps} />

          <View
            style={{
              alignSelf: "center",
              marginBottom: extraBottomMargin
            }}
          >
            <VSpacer size={spaceBetweenActionAndLink} />
            <ButtonLink color="primary" {...tertiaryActionProps} />
          </View>
        </>
      )}
    </>
  );
};
