import * as React from "react";
import { View, StyleSheet, Text, Switch } from "react-native";
import { useState } from "react";
import { NewH6 } from "../core/typography/NewH6";
import {
  IOSelectionListItemStyles,
  IOSelectionListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOColors, useIOTheme } from "../core/variables/IOColors";
import { IOIcons, Icon } from "../core/icons";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { makeFontStyleObject } from "../core/fonts";
import { NativeSwitch } from "../core/selection/checkbox/NativeSwitch";

type Props = {
  label: string;
  description?: string;
  icon?: IOIcons;
  // Dispatch the new value when the Switch changes state
  onSwitchValueChange?: (newValue: boolean) => void;
};

const DISABLED_OPACITY = 0.5;

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Props &
  Pick<React.ComponentProps<typeof Switch>, "value" | "disabled">;

/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
const styles = StyleSheet.create({
  legacyTextValue: {
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 24,
    color: IOColors.bluegreyDark,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});
/* REMOVE_LEGACY_COMPONENT: End ▶ */

export const SwitchListItem = ({
  label,
  description,
  icon,
  value,
  disabled,
  onSwitchValueChange
}: OwnProps) => {
  // Experimental Design System
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const [isEnabled, setToggleValue] = useState(value ?? false);

  // Theme
  const theme = useIOTheme();

  const toggleSwitch = () => {
    setToggleValue(previousState => !previousState);
    if (onSwitchValueChange !== undefined) {
      onSwitchValueChange(!isEnabled);
    }
  };

  return (
    <View
      testID="SwitchListItem"
      style={[
        IOSelectionListItemStyles.listItem,
        {
          opacity: disabled ? DISABLED_OPACITY : 1
        }
      ]}
      pointerEvents={disabled ? "none" : "auto"}
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
            {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */}
            {isDesignSystemEnabled ? (
              <NewH6 color={"black"} style={{ flexShrink: 1 }}>
                {label}
              </NewH6>
            ) : (
              <Text style={styles.legacyTextValue}>{label}</Text>
            )}
            {/* REMOVE_LEGACY_COMPONENT: End ▶ */}
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
        </View>

        <HSpacer size={8} />
        <View style={{ flexShrink: 0, alignSelf: "flex-start" }}>
          <NativeSwitch value={isEnabled} onValueChange={toggleSwitch} />
        </View>
      </View>
    </View>
  );
};
