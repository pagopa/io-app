import { ReactNode } from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated from "react-native-reanimated";
import { useIOTheme } from "../../context";
import { IOAccordionRadius, type IOSpacingScale } from "../../core";
import { IOColors, hexToRgba } from "../../core/IOColors";
import { useAccordionAnimation } from "../../hooks/useAccordionAnimation";
import { IOIconSizeScale, IOIcons, Icon } from "../icons/Icon";
import { Body, H6 } from "../typography";

export type AccordionItem = {
  title: string;
  body: string | ReactNode;
  accessibilityLabel?: string;
  icon?: IOIcons;
};

const accordionBodySpacing: IOSpacingScale = 16;
const accordionIconMargin: IOSpacingScale = 12;
const accordionChevronMargin: IOSpacingScale = 8;

// Icon size
const iconSize: IOIconSizeScale = 24;

export const AccordionItem = ({
  title,
  accessibilityLabel,
  body,
  icon
}: AccordionItem) => {
  const theme = useIOTheme();

  const {
    expanded,
    toggleAccordion,
    onBodyLayout,
    iconAnimatedStyle,
    bodyAnimatedStyle,
    bodyInnerStyle
  } = useAccordionAnimation();

  // Visual attributes
  const accordionBackground: IOColors = theme["appBackground-primary"];
  const accordionBorder: IOColors = theme["cardBorder-default"];
  const accordionIconColor: IOColors = theme["icon-decorative"];

  return (
    <View
      style={[
        styles.accordionWrapper,
        {
          backgroundColor: IOColors[accordionBackground],
          borderColor: IOColors[accordionBorder]
        }
      ]}
    >
      <TouchableWithoutFeedback
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={accessibilityLabel ?? title}
        onPress={toggleAccordion}
      >
        <View style={styles.textContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexShrink: 1,
              marginRight: accordionChevronMargin
            }}
          >
            {icon && (
              <View style={{ marginRight: accordionIconMargin }}>
                <Icon name={icon} size={iconSize} color={accordionIconColor} />
              </View>
            )}
            <View
              style={{ flexShrink: 1 }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <H6 color={theme["textBody-default"]}>{title}</H6>
            </View>
          </View>
          <Animated.View style={iconAnimatedStyle}>
            <Icon
              name="chevronBottom"
              color={theme["interactiveElem-default"]}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={bodyAnimatedStyle}
        importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      >
        <View style={bodyInnerStyle} onLayout={onBodyLayout}>
          {typeof body === "string" ? <Body>{body}</Body> : body}
        </View>
      </Animated.View>

      {/* This gradient adds a smooth end to the content. If it is missing,
      the content will be cut sharply during the height transition. */}
      <LinearGradient
        accessible={false}
        style={{
          height: accordionBodySpacing,
          position: "absolute",
          // Place at the bottom
          bottom: 0,
          // Avoid gradient overlaps with border radius
          left: accordionBodySpacing,
          right: accordionBodySpacing
        }}
        colors={[
          hexToRgba(IOColors[accordionBackground], 0),
          IOColors[accordionBackground]
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  accordionWrapper: {
    borderWidth: 1,
    borderRadius: IOAccordionRadius,
    borderCurve: "continuous"
  },
  textContainer: {
    padding: accordionBodySpacing,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
