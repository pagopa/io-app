import {
  H6,
  IOAccordionRadius,
  IOColors,
  IOSpacingScale,
  useIOThemeContext
} from "@io-app/design-system";
import { PropsWithChildren, ReactNode } from "react";
import {
  AccessibilityState,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import Animated from "react-native-reanimated";

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
  headerStyle?: StyleProp<ViewStyle>;
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

  const header = (
    <Animated.View
      accessibilityRole={headerAccessibilityRole}
      style={[styles.header, headerStyle]}
    >
      <LinearGradient
        colors={[itwTheme["card-background"], gradientEndColor]}
        style={StyleSheet.absoluteFill}
      />
      <H6 style={styles.title}>{title}</H6>
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
      {onHeaderPress ? (
        <TouchableWithoutFeedback
          accessibilityLabel={headerAccessibilityLabel ?? title}
          accessibilityRole="button"
          accessibilityState={headerAccessibilityState}
          accessible={true}
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
