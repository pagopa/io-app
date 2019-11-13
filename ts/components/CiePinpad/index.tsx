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

interface Props {
  description: string;
  pinLength: number;
  onPinChanged: (pin: string) => void;
}

interface State {
  pin: ReadonlyArray<string>;
  pinSelected: number;
  codeSplit: ReadonlyArray<string>;
}

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
      pin: new Array(this.props.pinLength).fill(""),
      pinSelected: 0,
      codeSplit: []
    };
  }

  private handleOnChangeText = (text: string, index: number) => {
    const pin = this.updatePin(text, index);
    this.props.onPinChanged(pin.join(""));
  };

  private updatePin = (text: string, index: number): string[] => {
    // tslint:disable-next-line: readonly-array
    const tempPin = [...this.state.pin];
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
      // if it is the first element, do nothing
      if (index === 0) {
        return;
      }
      // if (index !== 0) {
      //   this.inputs[index - 1].focus(); // it change the focus on the previous input
      //   // if (this.props.onDeleteLastDigit) {
      //   //   this.props.onDeleteLastDigit();
      //   // }
      // }
      // check if a deletion is going.

      if (!this.state.pin[index] || this.state.pin[index].length === 0) {
        this.updatePin("", index - 1);
        this.inputs[index - 1].focus();
      }
      return;
    }
    // if it is not the last element, change focus on next element
    if (index + 1 < this.inputs.length) {
      this.inputs[index + 1].focus();
      return;
    }
  };

  private inputBoxGenerator = (i: number) => {
    const margin = 2;
    const width = 36;
    const screenWidth = Dimensions.get("window").width;
    const totalMargins = margin * 2 * (this.props.pinLength - 1);
    const widthNeeded = width * this.props.pinLength + totalMargins;

    // if we have not enough space to place inputs
    // compute a new width to fit it
    // consider margin from both sides too

    const targetDimension =
      widthNeeded > screenWidth
        ? (screenWidth - totalMargins) / this.props.pinLength
        : width;

    // tslint:disable-next-line:no-commented-code
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
          autoFocus={false}
          caretHidden={true}
          value={this.state.pin[i]}
          onChangeText={text => this.handleOnChangeText(text, i)}
          onKeyPress={({ nativeEvent }) =>
            this.handleOnKeyPress(nativeEvent, i)
          }
        />

        <Baseline
          color={
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
    return (
      <View>
        <View style={styles.placeholderContainer}>
          {Array(8)
            .fill("")
            .map((_, i) => {
              return this.inputBoxGenerator(i);
            })}
        </View>
        <View spacer={true} />
        <Text>{this.props.description}</Text>
        {
          // FOR DEBUG PURPOSES ONLY
        }
        <Text>{`PIN->${this.state.pin.join("")}`}</Text>
      </View>
    );
  }
}

export default CiePinpad;
