import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  ListItemInfo as DSListItemInfo,
  Icon,
  IOIcons
} from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { WithTestID } from "../../types/WithTestID";
import { makeFontStyleObject } from "../core/fonts";
import { Body } from "../core/typography/Body";
import { IOColors } from "../core/variables/IOColors";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";

export type ListItemInfo = WithTestID<{
  label: string;
  value: string | React.ReactNode;
  numberOfLines?: number;
  icon?: IOIcons;
  // Accepted components: ButtonLink, IconButton
  // Don't use any components other than these
  action?: React.ReactNode;
  // Accessibility
  accessibilityLabel: string;
}>;

const styles = StyleSheet.create({
  textValue: {
    fontSize: 18,
    lineHeight: 24,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});

/**
 *
 * Represents a list item with label and value information.
 * It can display an optional icon and action element.
 * Currently if the Design System is enabled, the component returns the ListItemInfo of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param {string|JSX.Element} label - The label or JSX element to display as the item's label.
 * @param {string|JSX.Element} value - The value or JSX element to display as the item's value.
 * @param {number} [numberOfLines=2] - The maximum number of lines to display for the value.
 * @param {string} icon - The name of the icon to display (if any).
 * @param {JSX.Element} action - The JSX element representing the action element (if any).
 * @param {string} accessibilityLabel - The accessibility label for the item.
 * @param {string} testID - The test ID for testing purposes.
 *
 */
export const ListItemInfo = ({
  label,
  value,
  numberOfLines = 2,
  icon,
  action,
  accessibilityLabel,
  testID
}: ListItemInfo) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const LegacyListItemInfo = () => (
    <View
      style={IOListItemStyles.listItem}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={IOListItemStyles.listItemInner}>
        {icon && (
          <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
            <Icon
              name={icon}
              color="grey-450"
              size={IOListItemVisualParams.iconSize}
            />
          </View>
        )}
        <View style={IOStyles.flex}>
          {/* Let developer using a custom component (e.g: skeleton) */}
          {typeof label === "string" ? (
            <Body weight="Regular">{label}</Body>
          ) : (
            label
          )}
          {typeof value === "string" ? (
            <Text
              style={[styles.textValue, { color: IOColors.bluegreyDark }]}
              numberOfLines={numberOfLines}
            >
              {value}
            </Text>
          ) : (
            value
          )}
        </View>
        {action && (
          <View style={{ marginLeft: IOListItemVisualParams.actionMargin }}>
            {action}
          </View>
        )}
      </View>
    </View>
  );

  return isDesignSystemEnabled ? (
    <DSListItemInfo
      label={label}
      value={value}
      accessibilityLabel={accessibilityLabel}
      action={action}
      icon={icon}
      numberOfLines={numberOfLines}
      testID={testID}
    />
  ) : (
    <LegacyListItemInfo />
  );
};

export default ListItemInfo;
