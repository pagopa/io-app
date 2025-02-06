import { HeaderActionProps, IOColors } from "@pagopa/io-app-design-system";
import { ReactNode } from "react";
import { Dimensions, StatusBar } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import { IOScrollView, IOScrollViewActions } from "../ui/IOScrollView";
import { BonusCard } from "./BonusCard";

type BaseProps = {
  title?: string;
  headerAction?: HeaderActionProps;
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
    variant: "neutral",
    backgroundColor: IOColors["grey-50"],
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp,
    secondAction: headerAction,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef
  });

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <IOScrollView
        animatedRef={animatedScrollViewRef}
        actions={actions}
        includeContentMargins={false}
      >
        <BonusCard hideLogo={shouldHideLogo} {...cardProps} />
        {children}
      </IOScrollView>
    </>
  );
};

export { BonusCardScreenComponent };
