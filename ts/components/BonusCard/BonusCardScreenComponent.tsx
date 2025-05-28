import {
  HeaderActionProps,
  IOColors,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { ReactNode } from "react";
import { Dimensions } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import { isAndroid } from "../../utils/platform";
import FocusAwareStatusBar from "../ui/FocusAwareStatusBar";
import { IOScrollView, IOScrollViewActions } from "../ui/IOScrollView";
import { isScreenReaderEnabledSelector } from "../../store/reducers/preferences";
import { useIOSelector } from "../../store/hooks";
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

  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);

  const { themeType } = useIOThemeContext();

  const isDark = themeType === "dark";
  // We need to check if the card is a CGN type to set the background color
  const isCGNType = !cardProps.isLoading && cardProps.cardBackground;
  // Custom background color for CGN based on the platform
  const cgnBackgroundColor = isAndroid ? IOColors.white : IOColors["grey-50"];
  // If the card is not a CGN type, we set the default header background color as card color
  const backgroundColor = isCGNType
    ? cgnBackgroundColor
    : IOColors["blueIO-50"];

  useHeaderSecondLevel({
    title: title || "",
    transparent: !screenReaderEnabled,
    supportRequest: true,
    variant: "neutral",
    backgroundColor,
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp,
    secondAction: headerAction,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    ignoreAccessibilityCheck: true
  });

  return (
    <>
      <FocusAwareStatusBar
        barStyle={isAndroid && isDark ? "light-content" : "dark-content"}
      />
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
