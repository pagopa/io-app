import { ListItemSwitch } from "@pagopa/io-app-design-system";
import * as React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { makeFontStyleObject } from "../core/fonts";
import { IOIcons, Icon } from "../core/icons";
import { NativeSwitch } from "../core/selection/checkbox/NativeSwitch";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { LabelSmall } from "../core/typography/LabelSmall";
import { NewLink } from "../core/typography/NewLink";
import { IOColors, useIOTheme } from "../core/variables/IOColors";
import {
  IOSelectionListItemStyles,
  IOSelectionListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";

type Props = {
  label: string;
  // Dispatch the new value when the Switch changes state
  onSwitchValueChange?: (newValue: boolean) => void;
  description?: string;
  icon?: IOIcons;
  action?: SwitchAction;
};

type SwitchAction = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
};

const DISABLED_OPACITY = 0.5;

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Props &
  Pick<React.ComponentProps<typeof Switch>, "value" | "disabled">;

const styles = StyleSheet.create({
  legacyTextValue: {
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 24,
    color: IOColors.bluegreyDark,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});

/**
 *
 * Represents a list item with a switch (toggle) that can be turned on or off.
 * It supports an `onSwitchValueChange` event for handling switch state changes.
 * Currently if the Design System is enabled, the component returns the ListItemSwitch of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param {string} label - The label to display as the item's value.
 * @param {string} description - The description to display as the item's description.
 * @param {string} icon - The name of the icon to display beside the label.
 * @param {Object} action - An optional action to display as a link at the bottom of the item. The action object should have a `label` and an `onPress` function.
 * @param {boolean} value - The current value of the switch (true for on, false for off).
 * @param {boolean} disabled - If true, the item will be disabled and the switch will not be interactable.
 * @param {function} onSwitchValueChange - The function to be executed when the switch value changes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ListItemSwitch of the @pagopa/io-app-design-system library.
 *
 */
export const SwitchListItem = ({
  label,
  description,
  icon,
  action,
  value,
  disabled,
  onSwitchValueChange
}: OwnProps) => {
  // Experimental Design System
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  // Theme
  const theme = useIOTheme();

  return isDesignSystemEnabled ? (
    <ListItemSwitch
      label={label}
      disabled={disabled}
      onSwitchValueChange={onSwitchValueChange}
      action={action}
      description={description}
      icon={icon}
      value={value}
    />
  ) : (
    <View
      testID="SwitchListItem"
      style={[
        IOSelectionListItemStyles.listItem,
        {
          opacity: disabled ? DISABLED_OPACITY : 1
        }
      ]}
      pointerEvents={disabled ? "none" : "auto"}
      // This is required to avoid opacity
      // inheritance on Android
      needsOffscreenAlphaCompositing={true}
    >
      <View
        style={[
          IOSelectionListItemStyles.listItemInner,
          { alignItems: "center" }
        ]}
      >
        <View style={{ flexShrink: 1 }}>
          <View style={[IOStyles.row, { flexShrink: 1 }]}>
            {icon && (
              <View
                style={{
                  marginRight: IOSelectionListItemVisualParams.iconMargin
                }}
              >
                <Icon
                  name={icon}
                  color="grey-300"
                  size={IOSelectionListItemVisualParams.iconSize}
                />
              </View>
            )}
            {<Text style={styles.legacyTextValue}>{label}</Text>}
          </View>
          {description && (
            <>
              <VSpacer
                size={IOSelectionListItemVisualParams.descriptionMargin}
              />
              <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
                {description}
              </LabelSmall>
            </>
          )}
          {action && (
            <>
              <VSpacer size={IOSelectionListItemVisualParams.actionMargin} />
              <NewLink fontSize="small" onPress={action.onPress}>
                {action.label}
              </NewLink>
            </>
          )}
        </View>

        <HSpacer size={8} />
        <View style={{ flexShrink: 0, alignSelf: "flex-start" }}>
          <NativeSwitch value={value} onValueChange={onSwitchValueChange} />
        </View>
      </View>
    </View>
  );
};
