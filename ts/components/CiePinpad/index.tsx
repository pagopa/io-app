import { Text, View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData
} from "react-native";

import variables from "../../theme/variables";
import { Baseline } from "../Pinpad/Placeholders";

type Props = {
  description: string;
  pinLength: number;
  onPinChanged: (pin: string) => void;
};

type State = {
  pin: ReadonlyArray<string>;
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: variables.colorWhite
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
  }
});

const width = 36;
const margin = 2;
const screenWidth = Dimensions.get("window").width;
/**
 * A customized CodeInput component.
 */
class CiePinpad extends React.PureComponent<Props, State> {
  private inputs: ReadonlyArray<TextInput>;

  constructor(props: Props) {
    super(props);
    this.inputBoxGenerator = this.inputBoxGenerator.bind(this);
    this.inputs = [];
    this.state = {
      pin: new Array(this.props.pinLength).fill("")
    };
  }

  private handleOnChangeText = (text: string, index: number) => {
    const pin = this.updatePin(text, index);
    this.props.onPinChanged(pin.join(""));
    // if it is not the last element, change focus on next element
    // handleOnKeyPress is used to handle the Backspace press
    if (index + 1 < this.inputs.length) {
      this.inputs[index + 1].focus();
      return;
    }
  };

  // tslint:disable-next-line: readonly-array
  private updatePin = (text: string, index: number): string[] => {
    // tslint:disable-next-line: readonly-array
    const tempPin = [...this.state.pin];
    // replace the pin char at the index position
    tempPin.splice(index, 1, text);
    const pin: ReadonlyArray<string> = tempPin;
    this.setState({ pin });
    return tempPin;
  };

  private handleOnKeyPress = (
    nativeEvent: TextInputKeyPressEventData,
    index: number
  ) => {
    if (nativeEvent.key === "Backspace") {
      // check if a deletion is going. If yes, set the focus to the previous input
      // it works only if the index is not the first element
      if (
        (!this.state.pin[index] || this.state.pin[index].length === 0) &&
        index > 0
      ) {
        this.updatePin("", index - 1);
        this.inputs[index - 1].focus();
      }
      return;
    }
  };

  private readonly inputBoxGenerator = (i: number) => {
    const totalMargins = margin * 2 * (this.props.pinLength - 1);
    const widthNeeded = width * this.props.pinLength + totalMargins;

    // if we have not enough space to place inputs
    // compute a new width to fit it
    // consider margin from both sides too

    const targetDimension =
      widthNeeded > screenWidth
        ? (screenWidth - totalMargins) / this.props.pinLength
        : width;

    return (
      <View style={{ alignItems: "center" }} key={`input_view-${i}`}>
        <TextInput
          ref={c => {
            // collect all inputs refs
            if (c !== null && this.inputs.length < this.props.pinLength) {
              // tslint:disable-next-line: no-object-mutation
              this.inputs = [...this.inputs, c];
            }
          }}
          style={{
            width: targetDimension,
            height: targetDimension,
            textAlign: "center"
          }}
          key={`textinput-${i}`}
          maxLength={1}
          secureTextEntry={true}
          keyboardType="number-pad"
          autoFocus={i === 0} // The focus is on the first TextInput, in this way the opening of the keyboard is automatic
          caretHidden={true} // The caret is disabled to avoid confusing the user
          value={this.state.pin[i]}
          onChangeText={text => this.handleOnChangeText(text, i)}
          onKeyPress={({ nativeEvent }) =>
            this.handleOnKeyPress(nativeEvent, i)
          }
        />
        <Baseline
          color={
            // The color is based on the current box
            !this.state.pin[i] || this.state.pin[i].length === 0
              ? variables.brandLightGray
              : variables.brandDarkestGray
          }
          placeHolderStyle={{
            ...styles.placeHolderStyle,
            width: targetDimension
          }}
          key={`baseline-${i}`}
        />
      </View>
    );
  };

  public render() {
    // As many input boxes are created as pinLength props
    return (
      <View>
        <View style={styles.placeholderContainer}>
          {Array(this.props.pinLength)
            .fill("")
            .map((_, i) => {
              return this.inputBoxGenerator(i);
            })}
        </View>
        <View spacer={true} />
        <Text>{this.props.description}</Text>
      </View>
    );
  }
}

export default CiePinpad;
