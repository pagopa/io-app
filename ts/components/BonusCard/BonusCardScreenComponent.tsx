import { ActionProp } from "@pagopa/io-app-design-system";
import React from "react";
import { Dimensions } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { FAQsCategoriesType } from "../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../screens/BaseScreenComponent";
import { BonusCard, BonusCardProps } from "./BonusCard";

const triggerOffsetValue: number = 32;

type SupportRequestProps = {
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
};

type HeaderProps = {
  secondAction?: ActionProp;
  thirdAction?: ActionProp;
};

type ScreenProps = {
  children?: React.ReactElement;
};

export type BonusScreenComponentProps = ScreenProps &
  HeaderProps &
  SupportRequestProps &
  BonusCardProps;

const deviceScreenHeightLogoThreshold = 700;

const BonusCardScreenComponent = (props: BonusScreenComponentProps) => {
  const insets = useSafeAreaInsets();

  const screenHeight = Dimensions.get("window").height;
  const shouldHideLogo = screenHeight < deviceScreenHeightLogoThreshold;

  const { faqCategories, contextualHelpMarkdown, contextualHelp } = props;

  const { scrollHandler } = useHeaderSecondLevel({
    title: "",
    transparent: true,
    scrollTriggerOffsetValue: triggerOffsetValue,
    supportRequest: true,
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp,
    secondAction: props.secondAction
  });

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, triggerOffsetValue]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <BonusCard hideLogo={shouldHideLogo} {...props} />
      {props.children}
    </Animated.ScrollView>
  );
};

export { BonusCardScreenComponent };
