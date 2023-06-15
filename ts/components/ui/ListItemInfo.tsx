import * as React from "react";
import { View, StyleSheet, Text } from "react-native";

import { Icon, IOIcons } from "../core/icons";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOColors, useIOTheme } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { useIOSelector } from "../../store/hooks";
import { makeFontStyleObject } from "../core/fonts";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { NewH6 } from "../core/typography/NewH6";
import { Body } from "../core/typography/Body";
import { VSpacer } from "../core/spacer/Spacer";

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

  const theme = useIOTheme();

  /* ◀ REMOVE_LEGACY_COMPONENT: Start */
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
          <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
            {action}
          </View>
        )}
      </View>
    </View>
  );
  /* REMOVE_LEGACY_COMPONENT: End ▶ */

  const NewListItemInfo = () => (
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
          <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
            {label}
          </LabelSmall>
          <VSpacer size={4} />
          <NewH6
            color={theme["textBody-default"]}
            numberOfLines={numberOfLines}
          >
            {value}
          </NewH6>
        </View>
        {action && (
          <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
            {action}
          </View>
        )}
      </View>
    </View>
  );

  /* ◀ REMOVE_LEGACY_COMPONENT: Move the entire <NewListItemInfo /> here,
  without the following condition */
  return isDesignSystemEnabled ? <NewListItemInfo /> : <LegacyListItemInfo />;
};

export default ListItemInfo;
