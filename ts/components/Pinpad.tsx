import { View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from "react-native";
import CodeInput from "react-native-confirmation-code-input";

import { PinString } from "../types/PinString";
import { PIN_LENGTH } from "../utils/constants";

const deviceWidth = Dimensions.get("window").height;

const styles = StyleSheet.create({
  placeholder: {
    height: 40,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    width: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderBullet: {
    borderRadius: 24,
    height: 18,
    width: 18
  },
  placeholderBaseline: {
    borderBottomWidth: 2,
    marginTop: 10
  }
});

interface Props {
  compareWithCode?: string;
  inactiveColor: string;
  activeColor: string;
  codeInputRef?: React.Ref<CodeInput>;
  onFulfill: (code: PinString, isValid: boolean) => void;
}

interface State {
  value: PinString;
}

/**
 * A customized CodeInput component.
 */
class Pinpad extends React.PureComponent<Props, State> {
  private inputRef: React.RefObject<TextInput>;
  private placeholderPositions: ReadonlyArray<undefined>;

  constructor(props: Props) {
    super(props);

    this.state = {
      value: "" as PinString
    };

    this.inputRef = React.createRef();
    this.placeholderPositions = [...new Array(PIN_LENGTH)];
  }

  private handleChangeText = (inputValue: string) => {
    this.setState({ value: inputValue as PinString });

    if (inputValue.length === PIN_LENGTH) {
      const isValid = inputValue === this.props.compareWithCode;

      this.props.onFulfill(inputValue as PinString, isValid);
    }
  };

  private handlePlaceholderPress = () => {
    if (this.inputRef && this.inputRef.current) {
      this.inputRef.current.focus();
    }
  };

  private renderPlaceholder = (_: undefined, i: number) => {
    const isPlaceholderPopulated = i <= this.state.value.length - 1;
    const { activeColor, inactiveColor } = this.props;

    return (
      <TouchableOpacity key={i} onPress={this.handlePlaceholderPress}>
        {isPlaceholderPopulated ? (
          <Bullet color={activeColor} />
        ) : (
          <Baseline color={inactiveColor} />
        )}
      </TouchableOpacity>
    );
  };

  public clear = () => this.setState({ value: "" as PinString });

  public render() {
    return (
      <React.Fragment>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {this.placeholderPositions.map(this.renderPlaceholder)}
        </View>
        <TextInput
          ref={this.inputRef}
          style={{ position: "absolute", left: -deviceWidth }}
          keyboardType="numeric"
          autoFocus={true}
          value={this.state.value}
          onChangeText={this.handleChangeText}
          maxLength={PIN_LENGTH}
        />
      </React.Fragment>
    );
  }
}

interface PlaceholderProps {
  color: string;
}

const Bullet: React.SFC<PlaceholderProps> = ({ color }) => (
  <View style={styles.placeholder}>
    <View style={[styles.placeholderBullet, { backgroundColor: color }]} />
  </View>
);

const Baseline: React.SFC<PlaceholderProps> = ({ color }) => (
  <View
    style={[
      styles.placeholder,
      styles.placeholderBaseline,
      { borderBottomColor: color }
    ]}
  />
);

export default Pinpad;
