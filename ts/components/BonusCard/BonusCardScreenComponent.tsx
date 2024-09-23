import { ActionProp } from "@pagopa/io-app-design-system";
import { default as React, ReactNode } from "react";
import { Dimensions } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import { IOScrollView, IOScrollViewActions } from "../ui/IOScrollView";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { BonusCard } from "./BonusCard";

type BaseProps = {
  title?: string;
  headerAction?: ActionProp;
  children?: ReactNode;
  actions?: IOScrollViewActions;
};

export type BonusScreenComponentProps = BaseProps &
  SupportRequestParams &
  BonusCard;

/*
Let's reuse the variable names set in the PR#6088 to make the
the eventual refactoring much easier.
In this specific case, we set the threshold to show/hide
the `BonusCard` logo
*/
export const MIN_HEIGHT_TO_SHOW_FULL_RENDER = 700;

const BonusCardScreenComponent = ({
  title,
  headerAction,
  actions,
  faqCategories,
  contextualHelpMarkdown,
  contextualHelp,
  children,
  ...cardProps
}: BonusScreenComponentProps) => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const screenHeight = Dimensions.get("window").height;
  const shouldHideLogo = screenHeight < MIN_HEIGHT_TO_SHOW_FULL_RENDER;

  useHeaderSecondLevel({
    title: title || "",
    transparent: true,
    supportRequest: true,
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp,
    secondAction: headerAction,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef
  });

  return (
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      actions={actions}
      includeContentMargins={false}
    >
      <BonusCard hideLogo={shouldHideLogo} {...cardProps} />
      {children}
    </IOScrollView>
  );
};

export { BonusCardScreenComponent };
