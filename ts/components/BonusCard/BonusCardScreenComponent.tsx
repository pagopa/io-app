import {
  HeaderActionProps,
  hexToRgba,
  IOColors,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { ReactNode } from "react";
import { ColorSchemeName } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useDetectSmallScreen } from "../../hooks/useDetectSmallScreen";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { SupportRequestParams } from "../../hooks/useStartSupportRequest";
import { useIOSelector } from "../../store/hooks";
import { isScreenReaderEnabledSelector } from "../../store/reducers/preferences";
import { IOScrollView, IOScrollViewActions } from "../ui/IOScrollView";
import { BonusCard } from "./BonusCard";

export type BonusCardColorSchemeValues = {
  background: string;
  // Skeleton or other visual elements
  foreground: string;
  text: IOColors;
};

type CardThemeColors = Record<
  NonNullable<ColorSchemeName>,
  BonusCardColorSchemeValues
>;

type BaseProps = {
  title?: string;
  headerAction?: HeaderActionProps;
  children?: ReactNode;
  actions?: IOScrollViewActions;
  cardColors?: CardThemeColors;
};

export type BonusScreenComponentProps = BaseProps &
  SupportRequestParams &
  Exclude<BonusCard, "cardSpecificColors">;

export const defaultBonusCardColors: CardThemeColors = {
  light: {
    background: IOColors["blueItalia-50"],
    foreground: IOColors["blueItalia-100"],
    text: "blueItalia-850"
  },
  dark: {
    background: "#35364C",
    foreground: hexToRgba(IOColors["blueIO-300"], 0.3),
    text: "blueIO-50"
  }
};

const BonusCardScreenComponent = ({
  title,
  headerAction,
  actions,
  faqCategories,
  contextualHelpMarkdown,
  contextualHelp,
  children,
  cardColors,
  ...cardProps
}: BonusScreenComponentProps) => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const { isDeviceScreenSmall } = useDetectSmallScreen();
  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);
  const { themeType } = useIOThemeContext();

  const isDark = themeType === "dark";
  const cardThemeColorPalette = cardColors ?? defaultBonusCardColors;
  const cardColorSchemeValues = isDark
    ? cardThemeColorPalette.dark
    : cardThemeColorPalette.light;

  useHeaderSecondLevel({
    title: title || "",
    transparent: !screenReaderEnabled,
    supportRequest: true,
    backgroundColor: cardColorSchemeValues.background,
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp,
    secondAction: headerAction,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    ignoreAccessibilityCheck: true
  });

  return (
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      actions={actions}
      includeContentMargins={false}
    >
      <BonusCard
        hideLogo={isDeviceScreenSmall}
        cardColorSchemeValues={cardColorSchemeValues}
        {...cardProps}
      />
      {children}
    </IOScrollView>
  );
};

export { BonusCardScreenComponent };
