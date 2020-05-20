import { Text, View } from "native-base";
import * as React from "react";
import { Dimensions, StyleSheet, TextInput, Platform } from "react-native";
import variables from "../../theme/variables";
import { Baseline } from "../Pinpad/Placeholders";

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
    color: "black",
    textAlign: "center",
    fontSize: Platform.select({
      ios: variables.fontSize2,
      default: variables.fontSize3
    }),
    marginBottom: Platform.select({
      ios: 4,
      default: 0
    })
  },
  input: {
    backgroundColor: "red",
    color: "transparent",
    position: "absolute",
    width: 1,
    top: 0,
    left: -100,
    right: 0,
    bottom: 0
  }
});

const width = 36;
const margin = 2;
const screenWidth = Dimensions.get("window").width;
const sideMargin = 8;

/**
 * A customized CodeInput component.
 */

class CiePinpad extends React.PureComponent<Props> {
  private hiddenInput?: TextInput | null;

  constructor(props: Props) {
    super(props);
    this.inputBoxGenerator = this.inputBoxGenerator.bind(this);
  }

  private handleOnChangeText = (text: string) => {
    this.props.onPinChanged(text);
  };

  private handleOnFocus = () => {
    // force hidden input to have focus
    if (this.hiddenInput) {
      this.hiddenInput.focus();
    }
  };

  private handleOnSubmit = () => {
    {
      // if pin is full filled
      if (this.props.pin && this.props.pin.length === this.props.pinLength) {
        this.props.onSubmit(this.props.pin);
      }
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
          autoFocus={false}
          caretHidden={true} // The caret is disabled to avoid confusing the user
          value={this.props.pin && i < this.props.pin.length ? "●" : ""}
        />
        <Baseline
          color={
            // The color is based on the current box
            !this.props.pin || i >= this.props.pin.length
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
          maxLength={this.props.pinLength}
          caretHidden={true}
          onChangeText={this.handleOnChangeText}
          autoFocus={true}
          secureTextEntry={true}
          multiline={false}
          keyboardType="number-pad"
          onSubmitEditing={this.handleOnSubmit}
          value={this.props.pin}
        />
        <View spacer={true} />
        <View style={styles.placeholderContainer}>
          {Array(this.props.pinLength)
            .fill("")
            .map((_, i) => this.inputBoxGenerator(i))}
        </View>
        <View spacer={true} />
        <Text>{this.props.description}</Text>
      </View>
    );
  }
}

export default CiePinpad;
