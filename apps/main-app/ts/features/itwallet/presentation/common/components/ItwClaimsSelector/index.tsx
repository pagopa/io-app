import {
  Divider,
  H6,
  Icon,
  IOAccordionRadius,
  IOColors,
  IOSpacingScale,
  useIOThemeContext,
  useAccordionAnimation
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Fragment } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { getCredentialCardConfig } from "../../../../common/components/ItwCredentialCard/config";
import { ClaimDisplayFormat } from "../../../../common/utils/itwClaimsUtils";
import { getCredentialNameFromType } from "../../../../common/utils/itwCredentialUtils";
import { useItWalletTheme } from "../../../../common/utils/theme";
import { useClaimsDetailsBottomSheet } from "../../hooks/useClaimsDetailsBottomSheet";
import { ClaimItem } from "./ClaimItem";

const accordionBodySpacing: IOSpacingScale = 16;

// Threshold to determine when the accordion is considered fully collapsed
const COLLAPSED_RADIUS_THRESHOLD = 0.001;

// Border width offset to ensure gradient fits within the border curves
const COLLAPSIBLE_BORDER = 1;

type Props = {
  /**
   * Credential type to display as title of the accordion
   */
  credentialType: string;
  /**
   * The list of items to display within the accordion.
   */
  items: Array<ClaimDisplayFormat>;
  /**
   * Enable the selection of items with a checkbox.
   * @default false
   */
  selectionEnabled?: boolean;
  /**
   * The IDs of the selected items, when the component is controlled.
   */
  selectedItemIds?: Array<string>;
  /**
   * Whether the accordion starts expanded.
   * @default false
   */
  defaultExpanded?: boolean;
  /**
   * Function called when a item is selected.
   */
  onItemSelected?: (item: ClaimDisplayFormat, selected: boolean) => void;
  /**
   * Function called when the accordion is toggled to collapsed or expanded state.
   */
  onToggle?: (expanded: boolean) => void;
  /**
   * Accessibilty
   */
  accessibilityLabel?: string;
};

export const ItwClaimsSelector = ({
  credentialType,
  items,
  defaultExpanded,
  onItemSelected,
  onToggle,
  accessibilityLabel,
  selectedItemIds,
  selectionEnabled = false
}: Props) => {
  const { theme, themeType } = useIOThemeContext();
  const itwTheme = useItWalletTheme();
  const { present, bottomSheet } = useClaimsDetailsBottomSheet();
  const {
    expanded,
    toggleAccordion,
    onBodyLayout,
    iconAnimatedStyle,
    bodyAnimatedStyle,
    bodyInnerStyle,
    progress
  } = useAccordionAnimation({
    defaultExpanded
  });

  const title = getCredentialNameFromType(credentialType);
  const { background } = getCredentialCardConfig(credentialType, themeType);
  const accordionBackground: IOColors = theme["appBackground-primary"];
  const accordionBorder: IOColors = theme["cardBorder-default"];

  const onItemPress = () => {
    toggleAccordion();
    AccessibilityInfo.announceForAccessibility(
      I18n.t(
        !expanded
          ? "global.accessibility.expanded"
          : "global.accessibility.collapsed"
      )
    );
    onToggle?.(!expanded);
  };

  const headerRadiusAnimatedStyle = useAnimatedStyle(() => {
    /**
     * Dynamically adjust bottom corner radius based on the expansion progress.
     * Bottom corners are rounded only when the accordion is fully collapsed to
     * ensure visual consistency with the outer container.
     */
    const bottomRadius =
      progress.value < COLLAPSED_RADIUS_THRESHOLD ? IOAccordionRadius : 0;
    return {
      borderTopLeftRadius: IOAccordionRadius - COLLAPSIBLE_BORDER,
      borderTopRightRadius: IOAccordionRadius - COLLAPSIBLE_BORDER,
      borderBottomLeftRadius: bottomRadius - COLLAPSIBLE_BORDER,
      borderBottomRightRadius: bottomRadius - COLLAPSIBLE_BORDER,
      overflow: "hidden"
    };
  });

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
        onPress={onItemPress}
      >
        <Animated.View
          style={[styles.textContainer, headerRadiusAnimatedStyle]}
        >
          <LinearGradient
            colors={[itwTheme["card-background"], background.colors[0]]}
            style={StyleSheet.absoluteFill}
          />
          <H6 style={styles.title}>{title}</H6>
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
          {items.map((item, index) => (
            <Fragment key={item.id}>
              {index !== 0 && <Divider />}
              <ClaimItem
                item={item}
                selectionEnabled={selectionEnabled}
                isSelected={selectedItemIds?.includes(item.id)}
                onItemSelected={onItemSelected}
                present={present}
              />
            </Fragment>
          ))}
        </View>
      </Animated.View>
      {bottomSheet}
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
    alignItems: "center"
  },
  title: {
    flexGrow: 1,
    flexShrink: 1
  },
  iconContainer: {
    marginLeft: 16
  },
  bodyInnerContainer: {
    width: "100%"
  }
});
