import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, TextInput, TouchableWithoutFeedback } from "react-native";

import variables from "../../theme/variables";
import { PinString } from "../../types/PinString";

import { InputBox } from "./InputBox";

interface Props {
  inactiveColor: string;
  description: string;
  onFulfill: (code: PinString, isValid: boolean) => void;
  onCancel?: () => void;
  onDeleteLastDigit?: () => void;
}

interface State {
  value: string;
  pinSelected: number;
  codeSplit: ReadonlyArray<string>;
  textInputRef: TextInput | null;
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
  input: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1
  }
});

const PIN_LENGTH = 8;
const ARRAY_PIN = Array.from(Array(PIN_LENGTH).keys());

/**
 * A customized CodeInput component.
 */
class CiePinpad extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.updateCode = this.updateCode.bind(this);
    this.state = {
      value: "",
      pinSelected: 0,
      codeSplit: [],
      textInputRef: null
    };
  }

  private deleteLastDigit = () => {
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
  };

  private handleChangeText = (inputValue: string) => {
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
  };

  private handlePinDigit = (digit: string) => this.handleChangeText(`${digit}`);
  public updateCode = (char: string) => {
    alert(char);
  };

  public inputBoxGenerator = (item: number, i: number) => {
    const { inactiveColor } = this.props;

    const isSelected = (obj: number, index: number) => {
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
    };

    return (
      <InputBox
        key={`${i}-InputBox`}
        color={variables.brandDarkestGray}
        inactiveColor={inactiveColor}
        num={
          this.state.codeSplit.length < item + 1
            ? "0"
            : this.state.codeSplit[item]
        }
        wasSelected={wasSelected(item, i)}
        isSelected={isSelected(item, i)}
        isPopulated={this.state.value.length - 1 >= item}
      />
    );
  };

  public render() {
    return (
      <View>
        <View>
          <TextInput
            ref={ref => {
              this.setState({
                textInputRef: ref
              });
            }}
            autoFocus={true}
            keyboardType="number-pad"
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace") {
                this.deleteLastDigit();
              }
            }}
            onChangeText={text => {
              if (text.length > 0) {
                this.handlePinDigit(text);
              }
            }}
            caretHidden={true}
            style={styles.input}
          />
          <TouchableWithoutFeedback
            onPress={() => {
              if (this.state.textInputRef !== null) {
                this.state.textInputRef.focus();
              }
            }}
          >
            <View style={styles.placeholderContainer}>
              {ARRAY_PIN.map((item, i) => {
                return this.inputBoxGenerator(item, i);
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View spacer={true} />
        <Text>{this.props.description}</Text>
      </View>
    );
  }
}

export default CiePinpad;
