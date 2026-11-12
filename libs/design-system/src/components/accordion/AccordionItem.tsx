import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IODimensions, withAlpha } from "../../core";
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
  const accordionColors = useIOColors().component.accordion;

  const {
    expanded,
    toggleAccordion,
    onBodyLayout,
    iconAnimatedStyle,
    bodyAnimatedStyle,
    bodyInnerStyle
  } = useAccordionAnimation();

  return (
    <View
      style={[
        styles.accordionWrapper,
        {
          backgroundColor: accordionColors.background,
          borderColor: accordionColors.border
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
                color={accordionColors.foreground.icon}
                name={icon}
                size={IODimensions.size.icon.accordion}
              />
            )}
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ flexShrink: 1 }}
            >
              <H6 color={accordionColors.foreground.title}>{title}</H6>
            </View>
          </HStack>
          <Animated.View style={iconAnimatedStyle}>
            <Icon
              color={accordionColors.foreground.chevron}
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
          withAlpha(accordionColors.background, 0),
          accordionColors.background
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
