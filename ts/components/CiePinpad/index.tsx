import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, TextInput } from "react-native";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import InputPlaceHolder from "../Pinpad/InputPlaceholder";
import { INPUT_PLACEHOLDER_HEIGHT } from "../Pinpad/Placeholders";

type Props = {
  description: string;
  pinLength: number;
  onPinChanged: (pin: string) => void;
  onSubmit: (pin: string) => void;
  pin?: string;
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flexDirection: "row",
    justifyContent: "center"
  },
  text: {
    alignSelf: "center",
    justifyContent: "center",
    color: variables.colorWhite
  },
  placeHolderStyle: {
    height: 4,
    marginLeft: 2,
    marginRight: 2,
    marginTop: 2
  },
  textInputStyle: {
    textAlign: "center",
    fontSize: variables.fontSize3
  },
  input: {
    color: "transparent",
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
        activeColor={customVariables.colorBlack}
        inactiveColor={variables.brandLightGray}
        inputValue={props.pin || ""}
        accessibilityHint={I18n.t(
          "authentication.cie.pin.accessibility.placeholderLabel"
        )}
        accessibilityLabel={I18n.t(
          "identification.unlockCode.accessibility.unlockHint",
          {
            number: props.pin ? props.pin.length : 0,
            lenght: props.pinLength
          }
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
      <View spacer={true} />
      <Text>{props.description}</Text>
      <View spacer={true} />
    </View>
  );
};

export default CiePinpad;
