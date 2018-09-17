import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { TextInput, TouchableOpacity } from "react-native";

import { PinString } from "../../types/PinString";
import { PIN_LENGTH } from "../../utils/constants";

import { styles } from "./Pinpad.style";
import { Baseline, Bullet } from "./Placeholders";

const focusElement = (el: TextInput) => el.focus();
const blurElement = (el: TextInput) => el.blur();
const current = (ref: React.RefObject<TextInput>) => ref.current;

interface Props {
  compareWithCode?: string;
  inactiveColor: string;
  activeColor: string;
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

  public foldInputRef = (fn: (el: TextInput) => void) =>
    fromNullable(this.inputRef)
      .mapNullable(current)
      .fold(undefined, fn);

  private handleChangeText = (inputValue: string) => {
    this.setState({ value: inputValue as PinString });
    const pinValue = inputValue;

    // Pin is fulfilled
    if (pinValue.length === PIN_LENGTH) {
      const isValid = pinValue === this.props.compareWithCode;

      if (isValid) {
        this.foldInputRef(blurElement);
      }

      // Fire the callback asynchronously, otherwise this component
      // will be unmounted before the render of the last bullet placeholder.
      setTimeout(() => this.props.onFulfill(pinValue as PinString, isValid));
    }
  };

  private handlePlaceholderPress = () => this.foldInputRef(focusElement);

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
          style={styles.input}
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

export default Pinpad;
