import {
  HeaderActionProps,
  IOColors,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { ReactNode } from "react";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useDetectSmallScreen } from "../../hooks/useDetectSmallScreen";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import { useIOSelector } from "../../store/hooks";
import { isScreenReaderEnabledSelector } from "../../store/reducers/preferences";
import { isAndroid } from "../../utils/platform";
import FocusAwareStatusBar from "../ui/FocusAwareStatusBar";
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
  const { isDeviceScreenSmall } = useDetectSmallScreen();

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
        <BonusCard hideLogo={isDeviceScreenSmall} {...cardProps} />
        {children}
      </IOScrollView>
    </>
  );
};

export { BonusCardScreenComponent };
