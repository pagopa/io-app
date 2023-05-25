import * as React from "react";
import { useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { NewH6 } from "../../typography/NewH6";
import { IOStyles } from "../../variables/IOStyles";
import { HSpacer } from "../../spacer/Spacer";
import { IOColors } from "../../variables/IOColors";
import { useIOSelector } from "../../../../store/hooks";
import { makeFontStyleObject } from "../../fonts";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { AnimatedCheckbox } from "./AnimatedCheckbox";

type Props = {
  label: string;
  // dispatch the new value after the checkbox changes state
  onValueChange?: (newValue: boolean) => void;
};

const DISABLED_OPACITY = 0.5;

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Props &
  Pick<React.ComponentProps<typeof AnimatedCheckbox>, "disabled" | "checked"> &
  Pick<React.ComponentProps<typeof Pressable>, "onPress">;

/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
const styles = StyleSheet.create({
  legacyTextValue: {
    fontSize: 16,
    lineHeight: 24,
    color: IOColors.bluegreyDark,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});
/* REMOVE_LEGACY_COMPONENT: End ▶ */

/**
 * A checkbox with the automatic state management that uses a {@link AnimatedCheckBox}
 * The toggleValue change when a `onPress` event is received and dispatch the `onValueChange`.
 *
 * @param props
 * @constructor
 */
export const CheckboxLabel = ({
  label,
  checked,
  disabled,
  onValueChange
}: OwnProps) => {
  // Experimental Design System
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const [toggleValue, setToggleValue] = useState(checked ?? false);

  const toggleCheckbox = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setToggleValue(!toggleValue);
    if (onValueChange !== undefined) {
      onValueChange(!toggleValue);
    }
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={toggleCheckbox}
      testID="AnimatedCheckbox"
      style={{
        alignSelf: "flex-start",
        opacity: disabled ? DISABLED_OPACITY : 1
      }}
    >
      <View style={[IOStyles.row, { alignItems: "flex-start" }]}>
        <View pointerEvents="none">
          <AnimatedCheckbox checked={checked ?? toggleValue} />
        </View>
        <HSpacer size={8} />
        {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */}
        {isDesignSystemEnabled ? (
          <NewH6 color={"black"}>{label}</NewH6>
        ) : (
          <Text style={styles.legacyTextValue}>{label}</Text>
        )}
        {/* REMOVE_LEGACY_COMPONENT: End ▶ */}
      </View>
    </Pressable>
  );
};
