import * as React from "react";
import { View, StyleSheet, TextInput } from "react-native";
import I18n from "../../i18n";
import InputPlaceHolder from "../Pinpad/InputPlaceholder";
import { INPUT_PLACEHOLDER_HEIGHT } from "../Pinpad/Placeholders";
import { IOColors } from "../core/variables/IOColors";
import { VSpacer } from "../core/spacer/Spacer";

type Props = {
  pinLength: number;
  onPinChanged: (pin: string) => void;
  onSubmit: (pin: string) => void;
  pin?: string;
};

const styles = StyleSheet.create({
  input: {
    color: `transparent`,
    position: "absolute",
    width: "100%",
    height: INPUT_PLACEHOLDER_HEIGHT
  }
});

/**
 * A customized CodeInput component.
 */
const CiePinpad = (props: Props) => {
  const handleOnSubmit = () => {
    {
      // if pin is full filled
      if (props.pin && props.pin.length === props.pinLength) {
        props.onSubmit(props.pin);
      }
    }
  };

  return (
    <View>
      <InputPlaceHolder
        digits={props.pinLength}
        activeColor={IOColors.black}
        inactiveColor={IOColors.greyLight}
        inputValue={props.pin || ""}
        accessibilityLabel={I18n.t(
          "authentication.cie.pin.accessibility.placeholderLabel"
        )}
      />
      <TextInput
        style={styles.input}
        maxLength={props.pinLength}
        caretHidden={true}
        autoFocus={true}
        onChangeText={(pin: string) => {
          props.onPinChanged(pin);
        }}
        multiline={false}
        keyboardType={"number-pad"}
        onSubmitEditing={handleOnSubmit}
        value={props.pin}
        accessible={true}
        accessibilityLabel={I18n.t(
          "authentication.cie.pin.accessibility.label"
        )}
        accessibilityHint={I18n.t("authentication.cie.pin.accessibility.hint")}
      />
      <VSpacer size={16} />
    </View>
  );
};

export default CiePinpad;
