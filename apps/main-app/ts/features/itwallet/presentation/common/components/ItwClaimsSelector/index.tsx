import {
  Divider,
  Icon,
  IOAccordionRadius,
  useAccordionAnimation,
  useIOThemeContext
} from "@io-app/design-system";
import I18n from "i18next";
import { Fragment } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { getCredentialCardConfig } from "../../../../common/components/ItwCredentialCard/config";
import { ItwCredentialClaimsCard } from "../../../../common/components/ItwCredentialClaimsCard";
import { ClaimDisplayFormat } from "../../../../common/utils/itwClaimsUtils";
import { getCredentialNameFromType } from "../../../../common/utils/itwCredentialUtils";
import { useClaimsDetailsBottomSheet } from "../../hooks/useClaimsDetailsBottomSheet";
import { ClaimItem } from "./ClaimItem";

// Threshold to determine when the accordion is considered fully collapsed
const COLLAPSED_RADIUS_THRESHOLD = 0.001;

// Border width offset to ensure gradient fits within the border curves
const COLLAPSIBLE_BORDER = 1;

type Props = {
  /**
   * Accessibilty
   */
  accessibilityLabel?: string;
  /**
   * Credential type to display as title of the accordion
   */
  credentialType: string;
  /**
   * Whether the accordion starts expanded.
   * @default false
   */
  defaultExpanded?: boolean;
  /**
   * The list of items to display within the accordion.
   */
  items: Array<ClaimDisplayFormat>;
  /**
   * Function called when a item is selected.
   */
  onItemSelected?: (item: ClaimDisplayFormat, selected: boolean) => void;
  /**
   * Function called when the accordion is toggled to collapsed or expanded state.
   */
  onToggle?: (expanded: boolean) => void;
  /**
   * The IDs of the selected items, when the component is controlled.
   */
  selectedItemIds?: Array<string>;
  /**
   * Enable the selection of items with a checkbox.
   * @default false
   */
  selectionEnabled?: boolean;
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
  const { themeType } = useIOThemeContext();
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
    <ItwCredentialClaimsCard
      gradientEndColor={background.colors[0]}
      headerAccessibilityLabel={accessibilityLabel}
      headerAccessibilityState={{ expanded }}
      headerAccessory={
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <Icon name="chevronBottom" />
        </Animated.View>
      }
      headerStyle={headerRadiusAnimatedStyle}
      onHeaderPress={onItemPress}
      title={title}
    >
      <Animated.View style={bodyAnimatedStyle}>
        <View
          onLayout={onBodyLayout}
          style={[bodyInnerStyle, styles.bodyInnerContainer]}
        >
          {items.map((item, index) => (
            <Fragment key={item.id}>
              {index !== 0 && <Divider />}
              <ClaimItem
                isSelected={selectedItemIds?.includes(item.id)}
                item={item}
                onItemSelected={onItemSelected}
                present={present}
                selectionEnabled={selectionEnabled}
              />
            </Fragment>
          ))}
        </View>
      </Animated.View>
      {bottomSheet}
    </ItwCredentialClaimsCard>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginLeft: 16
  },
  bodyInnerContainer: {
    width: "100%"
  }
});
