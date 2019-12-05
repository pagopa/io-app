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
  onSubmit: (pin: string) => void;
};

type State = {
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1
  }
});

const width = 36;
const margin = 2;
const screenWidth = Dimensions.get("window").width;
const sideMargin = 8;

/**
 * A customized CodeInput component.
 */

class CiePinpad extends React.PureComponent<Props, State> {
  private inputs: ReadonlyArray<TextInput>;
  private hiddenInput?: TextInput | null;

  constructor(props: Props) {
    super(props);
    this.inputBoxGenerator = this.inputBoxGenerator.bind(this);
    this.inputs = [];
    this.state = {
      pin: undefined
    };
  }

  private handleOnChangeText2 = (text: string) => {
    this.setState({ pin: text });
    this.props.onPinChanged(text);
  };

  private handleOnFocus = () => {
    if (this.hiddenInput) {
      this.hiddenInput.focus();
    }
  };

  private readonly inputBoxGenerator = (i: number) => {
    const totalMargins =
      margin * 2 * (this.props.pinLength - 1) + sideMargin * 2;
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
            ...styles.textInputStyle,
            width: targetDimension
          }}
          key={`textinput-${i}`}
          editable={true}
          maxLength={1}
          secureTextEntry={false}
          multiline={false}
          keyboardType="number-pad"
          onFocus={this.handleOnFocus}
          autoFocus={false} // The focus is on the first TextInput, in this way the opening of the keyboard is automatic
          caretHidden={true} // The caret is disabled to avoid confusing the user
          value={this.state.pin && i < this.state.pin.length ? "●" : ""}
          //onChangeText={text => this.handleOnChangeText(text, i)}
        />
        <Baseline
          color={
            // The color is based on the current box
            !this.state.pin || i >= this.state.pin.length
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
        <TextInput
          style={styles.input}
          ref={c => {
            // tslint:disable-next-line: no-object-mutation
            this.hiddenInput = c;
          }}
          maxLength={8}
          caretHidden={true}
          onChangeText={this.handleOnChangeText2}
          autoFocus={true}
          secureTextEntry={true}
          multiline={false}
          keyboardType="number-pad"
          onSubmitEditing={() => {
            if (
              this.state.pin &&
              this.state.pin.length === this.props.pinLength
            ) {
              this.props.onSubmit(this.state.pin);
            }
          }}
        />
        <View spacer={true} />
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
