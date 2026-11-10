import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IODimensions } from "../../core";
import { hexToRgba, IOColors } from "../../core/IOColors";
import { useAccordionAnimation } from "../../hooks/useAccordionAnimation";
import { Icon, IOIcons } from "../icons/Icon";
import { HStack } from "../layout";
import { Body, H6 } from "../typography";

export type AccordionItem = {
  accessibilityLabel?: string;
  body: ReactNode | string;
  icon?: IOIcons;
  title: string;
};

const accordionPadding = IODimensions.padding.accordion;

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
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessible={true}
        onPress={toggleAccordion}
      >
        <View style={styles.textContainer}>
          <HStack
            space={IODimensions.gap.accordion.leading}
            style={{ alignItems: "center", flexShrink: 1 }}
          >
            {icon && (
              <Icon
                color={accordionIconColor}
                name={icon}
                size={IODimensions.size.icon.accordion}
              />
            )}
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ flexShrink: 1 }}
            >
              <H6 color={theme["textBody-default"]}>{title}</H6>
            </View>
          </HStack>
          <Animated.View style={iconAnimatedStyle}>
            <Icon
              color={theme["interactiveElem-default"]}
              name="chevronBottom"
              size={IODimensions.size.icon.chevron}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
        style={bodyAnimatedStyle}
      >
        <View onLayout={onBodyLayout} style={bodyInnerStyle}>
          {typeof body === "string" ? <Body>{body}</Body> : body}
        </View>
      </Animated.View>

      {/* This gradient adds a smooth end to the content. If it is missing,
      the content will be cut sharply during the height transition. */}
      <LinearGradient
        accessible={false}
        colors={[
          hexToRgba(IOColors[accordionBackground], 0),
          IOColors[accordionBackground]
        ]}
        style={{
          height: accordionPadding,
          position: "absolute",
          // Place at the bottom
          bottom: 0,
          // Avoid gradient overlaps with border radius
          left: accordionPadding,
          right: accordionPadding
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  accordionWrapper: {
    borderWidth: IODimensions.stroke.default,
    borderRadius: IODimensions.radius.accordion,
    borderCurve: "continuous"
  },
  textContainer: {
    padding: accordionPadding,
    columnGap: IODimensions.gap.accordion.trailing,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
