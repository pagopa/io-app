import { Input, Text, View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback
} from "react-native";

import variables from "../../theme/variables";
import { PinString } from "../../types/PinString";
import { Baseline } from "../Pinpad/Placeholders";

import { InputBox } from "./InputBox";

interface Props {
  description: string;
  onFulfill: (code: PinString, isValid: boolean) => void;
  onCancel?: () => void;
  onDeleteLastDigit?: () => void;
}

interface State {
  value: string;
  pin: string[];
  pinSelected: number;
  codeSplit: ReadonlyArray<string>;
  textInputRef: Input[];
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

const PIN_LENGTH = 8;
const ARRAY_PIN = Array.from(Array(PIN_LENGTH).keys());

/**
 * A customized CodeInput component.
 */
class CiePinpad extends React.PureComponent<Props, State> {
  private inputs: TextInput[];
  constructor(props: Props) {
    super(props);
    this.updateCode = this.updateCode.bind(this);
    this.inputBoxGenerator = this.inputBoxGenerator.bind(this);
    this.inputs = [];
    this.state = {
      value: "",
      pin: new Array(8).fill(""),
      pinSelected: 0,
      codeSplit: [],
      textInputRef: []
    };
  }

  /* private deleteLastDigit = () => {
    this.setState(prev => ({
      value:
        prev.value.length > 0
          ? prev.value.slice(0, prev.value.length - 1)
          : prev.value
    }));

    this.setState(prev => ({
      pinSelected: prev.pinSelected > 0 ? prev.pinSelected - 1 : 0
    }));

    if (this.props.onDeleteLastDigit) {
      this.props.onDeleteLastDigit();
    }
  };*/

  /* private handleChangeText = (inputValue: string) => {
    const array = inputValue.split("");
    this.setState({
      value: inputValue,
      pinSelected: inputValue.length - 1,
      codeSplit: array
    });

    // Pin is fulfilled
    if (inputValue.length === ARRAY_PIN.length) {
      this.props.onFulfill(inputValue as PinString, true);
    }
  };*/

  // private handlePinDigit = (digit: string) => this.handleChangeText(`${digit}`);
  public updateCode = (char: string) => {
    alert(char);
  };

  private inputBoxGenerator = (item: number, i: number) => {
    // tslint:disable-next-line:no-commented-code
    /*const isSelected = (obj: number, index: number) => {
      switch (true) {
        case index === 0:
          return this.state.pinSelected === 0 && this.state.value.length < 1;
        case index === 1:
          return this.state.pinSelected === 0 && this.state.value.length === 1;
        case index > 1:
          return this.state.pinSelected === obj - 1;
      }
      return false;
    };

    const wasSelected = (obj: number, index: number) => {
      switch (true) {
        case index !== ARRAY_PIN.length - 1:
          return this.state.pinSelected === obj;
        case index === ARRAY_PIN.length - 1:
          return false;
      }
      return false;
    };*/

    const margin = 2;
    const screenWidth = Dimensions.get("window").width;
    const totalMargins = margin * 2 * (PIN_LENGTH - 1);
    const widthNeeded = 36 * PIN_LENGTH + totalMargins;

    // if we have not enough space to place inputs
    // compute a new width to fit it
    // consider margin from both sides too

    const targetWidth =
      widthNeeded > screenWidth
        ? (screenWidth - totalMargins) / PIN_LENGTH
        : 36;

    // tslint:disable-next-line:no-commented-code
    // console.warn(`${i}->${this.state.pin[i]}`);
    return (
      <View style={{ alignItems: "center" }}>
        <TextInput
          ref={c => {
            // collect all inputs refs
            if (c !== null && this.inputs.length < PIN_LENGTH) {
              // tslint:disable-next-line: no-object-mutation
              this.inputs = [...this.inputs, c];
            }
          }}
          style={{
            width: 36,
            height: 36,
            textAlign: "center"
          }}
          maxLength={1}
          secureTextEntry={true}
          keyboardType="number-pad"
          autoFocus={false}
          caretHidden={false}
          onChangeText={text => {
            const pin = this.state.pin;
            pin.splice(i, 1, text);
            this.setState({ pin: [...pin] });
            if (pin.some(p => p === "") === false) {
              this.props.onFulfill(pin.join("") as PinString, true);
            }
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace") {
              // if it is the first element, do nothing
              if (i === 0) {
                return;
              }
              // check if a deletion is going.
              // if yes change focus on the previous input
              if (!this.state.pin[i] || this.state.pin[i].length === 0) {
                this.inputs[i - 1].setState({ value: "" });
                this.inputs[i - 1].focus();
              }
              return;
            }
            // if it is not the last element, change focus on next element
            if (i + 1 < this.inputs.length) {
              this.inputs[i + 1].focus();
              return;
            }
          }}
        />

        <Baseline
          color={
            !this.state.pin[i] || this.state.pin[i].length === 0
              ? variables.brandLightGray
              : variables.brandDarkestGray
          }
          placeHolderStyle={{ ...styles.placeHolderStyle, width: targetWidth }}
          key={`baseline-${i}`}
        />
      </View>
    );

    // return (
    //   <InputBox
    //     key={`${i}-InputBox`}
    //     color={variables.brandDarkestGray}
    //     inactiveColor={variables.brandLightGray}
    //     num={
    //       this.state.codeSplit.length < item + 1
    //         ? "0"
    //         : this.state.codeSplit[item]
    //     }
    //     wasSelected={wasSelected(item, i)}
    //     isSelected={isSelected(item, i)}
    //     isPopulated={this.state.value.length - 1 >= item}
    //   />
    // );
  };

  public render() {
    return (
      <View>
        <View style={styles.placeholderContainer}>
          {ARRAY_PIN.map((item, i) => {
            return this.inputBoxGenerator(item, i);
          })}
        </View>
        <View spacer={true} />
        <Text>{this.props.description}</Text>
      </View>
    );
  }
}

export default CiePinpad;
