import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  IOColors,
  IOSpacer,
  IOSpacingScale,
  IOStyles,
  IOVisualCostants,
  VSpacer,
  hexToRgba
} from "@pagopa/io-app-design-system";
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useMemo,
  useState
} from "react";

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

export type ServiceActionsProps =
  | {
      type: "SingleCta";
      primaryActionProps: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondaryActionProps?: never;
      tertiaryActionProps?: never;
    }
  | {
      type: "SingleCtaCustomFlow";
      primaryActionProps: ComponentProps<typeof ServiceSpecialAction>;
      secondaryActionProps?: never;
      tertiaryActionProps?: never;
    }
  | {
      type: "SingleCtaWithCustomFlow";
      primaryActionProps: ComponentProps<typeof ServiceSpecialAction>;
      secondaryActionProps: ComponentProps<typeof ButtonLink>;
      tertiaryActionProps?: never;
    }
  | {
      type: "TwoCtas";
      primaryActionProps: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondaryActionProps: ComponentProps<typeof ButtonLink>;
      tertiaryActionProps?: never;
    }
  | {
      type: "TwoCtasWithCustomFlow";
      primaryActionProps: ComponentProps<typeof ServiceSpecialAction>;
      secondaryActionProps: Omit<
        ComponentProps<typeof ButtonOutline>,
        "fullWidth"
      >;
      tertiaryActionProps: ComponentProps<typeof ButtonLink>;
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
  const safeAreaInsets = useSafeAreaInsets();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);

  const getActionBlockHeight = (event: LayoutChangeEvent) => {
    setActionBlockHeight(event.nativeEvent.layout.height);
  };

  const bottomMargin: number = useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  const safeBackgroundBlockHeight: number = useMemo(
    () => (bottomMargin + actionBlockHeight) * 0.85,
    [actionBlockHeight, bottomMargin]
  );

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight: number = useMemo(
    () => bottomMargin + actionBlockHeight + gradientSafeAreaHeight,
    [actionBlockHeight, bottomMargin]
  );

  /* Height of the safe bottom area, applied to the ScrollView:
     Actions + Content end margin */
  const safeBottomAreaHeight: number = useMemo(
    () => bottomMargin + actionBlockHeight + contentEndMargin,
    [actionBlockHeight, bottomMargin]
  );

  useHeaderSecondLevel({
    title,
    supportRequest: true,
    transparent: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    }
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

  const renderFooter = useCallback((props: ServiceActionsProps) => {
    switch (props.type) {
      case "SingleCta":
        return <ButtonSolid fullWidth {...props.primaryActionProps} />;
      case "SingleCtaCustomFlow":
        return <ServiceSpecialAction {...props.primaryActionProps} />;
      case "SingleCtaWithCustomFlow":
        return (
          <>
            <ServiceSpecialAction {...props.primaryActionProps} />
            <VSpacer size={spaceBetweenActionAndLink} />
            <View style={IOStyles.selfCenter}>
              <ButtonLink {...props.secondaryActionProps} />
            </View>
          </>
        );
      case "TwoCtas":
        return (
          <>
            <ButtonSolid fullWidth {...props.primaryActionProps} />
            <VSpacer size={spaceBetweenActionAndLink} />
            <View style={IOStyles.selfCenter}>
              <ButtonLink {...props.secondaryActionProps} />
            </View>
          </>
        );
      case "TwoCtasWithCustomFlow":
        return (
          <>
            <ServiceSpecialAction {...props.primaryActionProps} />
            <VSpacer size={spaceBetweenActions} />
            <ButtonOutline fullWidth {...props.secondaryActionProps} />
            <VSpacer size={spaceBetweenActionAndLink} />
            <View style={IOStyles.selfCenter}>
              <ButtonLink {...props.tertiaryActionProps} />
            </View>
          </>
        );
    }
  }, []);

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
            {renderFooter(actionsProps)}
          </View>
        </View>
      )}
    </>
  );
};
