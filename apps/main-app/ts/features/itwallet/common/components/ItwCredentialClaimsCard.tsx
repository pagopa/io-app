import {
  H6,
  IOAccordionRadius,
  IOColors,
  IOSpacingScale,
  useIOThemeContext
} from "@io-app/design-system";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren, ReactNode } from "react";
import {
  AccessibilityState,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

import { useItWalletTheme } from "../utils/theme";

const cardSpacing: IOSpacingScale = 16;

// Border width offset to ensure the header gradient fits within the border curves.
const CARD_BORDER = 1;

type ItwCredentialClaimsCardProps = PropsWithChildren<{
  /** The end color of the credential-specific header gradient. */
  gradientEndColor: string;
  /** Accessibility label assigned to the interactive card header. */
  headerAccessibilityLabel?: string;
  /** Accessibility role assigned to the card header. */
  headerAccessibilityRole?: "header";
  /** Accessibility state assigned to the interactive card header. */
  headerAccessibilityState?: AccessibilityState;
  /** Optional content displayed at the end of the header. */
  headerAccessory?: ReactNode;
  /** Additional styles for the header, including animated styles. */
  headerStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  /** Called when the interactive card header is pressed. */
  onHeaderPress?: () => void;
  /** The title displayed in the card header. */
  title: string;
}>;

/**
 * Renders the common visual structure for credential claims: a bordered card
 * with a credential-themed gradient header and arbitrary body content.
 */
export const ItwCredentialClaimsCard = ({
  children,
  gradientEndColor,
  headerAccessory,
  headerAccessibilityRole,
  headerAccessibilityLabel,
  headerAccessibilityState,
  headerStyle,
  onHeaderPress,
  title
}: ItwCredentialClaimsCardProps) => {
  const { theme } = useIOThemeContext();
  const itwTheme = useItWalletTheme();

  const isHeaderInteractive = onHeaderPress !== undefined;

  const header = (
    <Animated.View
      accessibilityRole={headerAccessibilityRole}
      style={[styles.header, headerStyle]}
    >
      <LinearGradient
        colors={[itwTheme["card-background"], gradientEndColor]}
        style={StyleSheet.absoluteFill}
      />
      {/*
        When the header is pressable its title is already announced by the
        touchable accessibility label, so it is hidden to avoid a duplicate
        announcement. A static header must keep exposing its own title.
      */}
      <View
        accessibilityElementsHidden={isHeaderInteractive}
        importantForAccessibility={
          isHeaderInteractive ? "no-hide-descendants" : "auto"
        }
        style={styles.title}
      >
        <H6>{title}</H6>
      </View>
      {headerAccessory}
    </Animated.View>
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: IOColors[theme["appBackground-primary"]],
          borderColor: IOColors[theme["cardBorder-default"]]
        }
      ]}
    >
      {isHeaderInteractive ? (
        <TouchableWithoutFeedback
          accessibilityLabel={headerAccessibilityLabel ?? title}
          accessibilityRole="button"
          accessibilityState={headerAccessibilityState}
          onPress={onHeaderPress}
        >
          {header}
        </TouchableWithoutFeedback>
      ) : (
        header
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: IOAccordionRadius,
    borderCurve: "continuous"
  },
  header: {
    padding: cardSpacing,
    borderTopLeftRadius: IOAccordionRadius - CARD_BORDER,
    borderTopRightRadius: IOAccordionRadius - CARD_BORDER,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center"
  },
  title: {
    flexGrow: 1,
    flexShrink: 1
  }
});
