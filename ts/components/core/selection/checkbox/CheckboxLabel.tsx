import { CheckboxLabel as DSCheckboxLabel } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { makeFontStyleObject } from "../../fonts";
import { HSpacer } from "../../spacer/Spacer";
import { IOColors } from "../../variables/IOColors";
import { IOStyles } from "../../variables/IOStyles";
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

const styles = StyleSheet.create({
  legacyTextValue: {
    fontSize: 16,
    lineHeight: 24,
    color: IOColors.bluegreyDark,
    flexShrink: 1,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});

/**
 * A checkbox with the automatic state management that uses a {@link AnimatedCheckBox}
 * The toggleValue change when a `onPress` event is received and dispatch the `onValueChange`.
 * Currently if the Design System is enabled, the component returns the CheckboxLabel of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param props
 * @constructor
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the CheckboxLabel of the @pagopa/io-app-design-system library.
 *
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

  return isDesignSystemEnabled ? (
    <DSCheckboxLabel
      label={label}
      checked={checked}
      disabled={disabled}
      onValueChange={onValueChange}
      onPress={toggleCheckbox}
    />
  ) : (
    <Pressable
      disabled={disabled}
      onPress={toggleCheckbox}
      testID="AnimatedCheckbox"
      style={{
        alignSelf: "flex-start",
        opacity: disabled ? DISABLED_OPACITY : 1
      }}
      // This is required to avoid opacity
      // inheritance on Android
      needsOffscreenAlphaCompositing={true}
    >
      <View style={[IOStyles.row, { alignItems: "center", width: "100%" }]}>
        <View
          pointerEvents="none"
          style={{
            alignSelf: "flex-start"
          }}
        >
          <AnimatedCheckbox checked={checked ?? toggleValue} />
        </View>
        <HSpacer size={8} />
        {<Text style={styles.legacyTextValue}>{label}</Text>}
      </View>
    </Pressable>
  );
};
