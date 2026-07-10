import {
  H6,
  Icon,
  IOAccordionRadius,
  IOColors,
  IOSpacingScale,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { useAccordionAnimation } from "@pagopa/io-app-design-system/src/hooks/useAccordionAnimation";
import I18n from "i18next";
import { ReactNode } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useItWalletTheme } from "../../utils/theme";

const cardSpacing: IOSpacingScale = 16;

// Threshold to determine when the accordion is considered fully collapsed
const COLLAPSED_RADIUS_THRESHOLD = 0.001;

// Border width offset to ensure the header gradient fits within the border curves
const CARD_BORDER = 1;

type StaticHeaderProps = {
  /**
   * When omitted or `false` the header is static and the body is always visible.
   */
  collapsible?: false;
};

type CollapsibleHeaderProps = {
  /**
   * Renders the header as an accordion toggle that expands/collapses the body.
   */
  collapsible: true;
  /**
   * Whether the accordion starts expanded.
   * @default false
   */
  defaultExpanded?: boolean;
  /**
   * Function called when the accordion is toggled to collapsed or expanded state.
   */
  onToggle?: (expanded: boolean) => void;
  /**
   * Accessibility label for the header toggle. Falls back to the title.
   */
  accessibilityLabel?: string;
};

export type ItwCredentialClaimsCardProps = {
  /**
   * The credential name displayed in the card header.
   */
  title: string;
  /**
   * End stop of the header gradient, typically `background.colors[0]`
   * from the credential card config.
   */
  headerGradientColor: string;
  /**
   * Card body content.
   */
  children: ReactNode;
  /**
   * Rendered inside the card wrapper, after the body (e.g. bottom sheets).
   */
  footer?: ReactNode;
} & (StaticHeaderProps | CollapsibleHeaderProps);

/**
 * Bordered card with a header displaying the credential name over the
 * credential theme gradient. The header can be static (body always visible)
 * or collapsible (accordion behavior). Shared building block for credential
 * claims lists across issuance and presentation flows.
 */
export const ItwCredentialClaimsCard = (
  props: ItwCredentialClaimsCardProps
) => {
  const { title, headerGradientColor, children, footer } = props;
  const { theme } = useIOThemeContext();
  const itwTheme = useItWalletTheme();
  const {
    expanded,
    toggleAccordion,
    onBodyLayout,
    iconAnimatedStyle,
    bodyAnimatedStyle,
    bodyInnerStyle,
    progress
  } = useAccordionAnimation({
    defaultExpanded: props.collapsible ? props.defaultExpanded : true
  });

  const gradientColors = [itwTheme["card-background"], headerGradientColor];

  const headerRadiusAnimatedStyle = useAnimatedStyle(() => {
    /**
     * Dynamically adjust bottom corner radius based on the expansion progress.
     * Bottom corners are rounded only when the accordion is fully collapsed to
     * ensure visual consistency with the outer container.
     */
    const bottomRadius =
      progress.value < COLLAPSED_RADIUS_THRESHOLD ? IOAccordionRadius : 0;
    return {
      borderTopLeftRadius: IOAccordionRadius - CARD_BORDER,
      borderTopRightRadius: IOAccordionRadius - CARD_BORDER,
      borderBottomLeftRadius: bottomRadius - CARD_BORDER,
      borderBottomRightRadius: bottomRadius - CARD_BORDER,
      overflow: "hidden"
    };
  });

  const onHeaderPress = () => {
    toggleAccordion();
    AccessibilityInfo.announceForAccessibility(
      I18n.t(
        !expanded
          ? "global.accessibility.expanded"
          : "global.accessibility.collapsed"
      )
    );
    if (props.collapsible) {
      props.onToggle?.(!expanded);
    }
  };

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
      {props.collapsible ? (
        <>
          <TouchableWithoutFeedback
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={props.accessibilityLabel ?? title}
            onPress={onHeaderPress}
          >
            <Animated.View
              style={[styles.collapsibleHeader, headerRadiusAnimatedStyle]}
            >
              <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFill}
              />
              <H6 style={styles.collapsibleTitle}>{title}</H6>
              <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <Icon name="chevronBottom" />
              </Animated.View>
            </Animated.View>
          </TouchableWithoutFeedback>
          <Animated.View style={bodyAnimatedStyle}>
            <View
              style={[bodyInnerStyle, styles.bodyInnerContainer]}
              onLayout={onBodyLayout}
            >
              {children}
            </View>
          </Animated.View>
        </>
      ) : (
        <>
          <View style={styles.staticHeader} accessibilityRole="header">
            <LinearGradient
              colors={gradientColors}
              style={StyleSheet.absoluteFill}
            />
            <H6 style={styles.staticTitle}>{title}</H6>
          </View>
          {children}
        </>
      )}
      {footer}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: IOAccordionRadius,
    borderCurve: "continuous"
  },
  staticHeader: {
    padding: cardSpacing,
    borderTopLeftRadius: IOAccordionRadius - CARD_BORDER,
    borderTopRightRadius: IOAccordionRadius - CARD_BORDER,
    overflow: "hidden"
  },
  staticTitle: {
    flexShrink: 1
  },
  collapsibleHeader: {
    padding: cardSpacing,
    flexDirection: "row",
    alignItems: "center"
  },
  collapsibleTitle: {
    flexGrow: 1,
    flexShrink: 1
  },
  iconContainer: {
    marginLeft: cardSpacing
  },
  bodyInnerContainer: {
    width: "100%"
  }
});
