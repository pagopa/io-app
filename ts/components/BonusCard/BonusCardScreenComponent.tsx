import {
  ActionProp,
  ButtonSolidProps,
  GradientBottomActions,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  buttonSolidHeight
} from "@pagopa/io-app-design-system";
import React from "react";
import { Dimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { FAQsCategoriesType } from "../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../screens/BaseScreenComponent";
import { BonusCard } from "./BonusCard";

type SupportRequestProps = {
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
};

type BaseProps = {
  title?: string;
  headerAction?: ActionProp;
  children?: React.ReactNode;
  footerCta?: Omit<ButtonSolidProps, "fullWidth">;
};

export type BonusScreenComponentProps = BaseProps &
  SupportRequestProps &
  BonusCard;

const scrollTriggerOffsetValue: number = 88;

const deviceScreenHeightLogoThreshold = 700;

const gradientSafeArea: IOSpacingScale = 80;
const contentEndMargin: IOSpacingScale = 32;
const spaceBetweenActions: IOSpacer = 24;

const BonusCardScreenComponent = ({
  title,
  headerAction,
  children,
  footerCta,
  faqCategories,
  contextualHelpMarkdown,
  contextualHelp,
  ...cardProps
}: BonusScreenComponentProps) => {
  const safeAreaInsets = useSafeAreaInsets();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

  const screenHeight = Dimensions.get("window").height;
  const shouldHideLogo = screenHeight < deviceScreenHeightLogoThreshold;

  const bottomMargin: number = React.useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  const safeBottomAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + contentEndMargin,
    [bottomMargin]
  );

  const gradientAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + gradientSafeArea,
    [bottomMargin]
  );

  useHeaderSecondLevel({
    title: title || "",
    transparent: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp,
    secondAction: headerAction
  });

  const footerGradientOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(gradientOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  const footerComponent = footerCta && (
    <GradientBottomActions
      primaryActionProps={footerCta}
      transitionAnimStyle={footerGradientOpacityTransition}
      dimensions={{
        bottomMargin,
        extraBottomMargin: 0,
        gradientAreaHeight,
        spaceBetweenActions,
        safeBackgroundHeight: bottomMargin
      }}
    />
  );

  const scrollHandler = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      // eslint-disable-next-line functional/immutable-data
      scrollTranslationY.value = contentOffset.y;

      const isEndReached =
        Math.floor(layoutMeasurement.height + contentOffset.y) >=
        Math.floor(contentSize.height);

      // eslint-disable-next-line functional/immutable-data
      gradientOpacity.value = isEndReached ? 0 : 1;
    }
  );

  return (
    <>
      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: safeBottomAreaHeight
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToOffsets={[0, scrollTriggerOffsetValue]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        <BonusCard hideLogo={shouldHideLogo} {...cardProps} />
        {children}
      </Animated.ScrollView>
      {footerComponent}
    </>
  );
};

export { BonusCardScreenComponent };
