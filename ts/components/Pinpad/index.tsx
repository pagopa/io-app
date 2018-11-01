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
  activeColor: string;
  clearOnInvalid?: boolean;
  compareWithCode?: string;
  inactiveColor: string;
  onFulfill: (code: PinString, isValid: boolean) => void;
}

interface State {
  value: string;
  isFocused: boolean;
}

/**
 * A customized CodeInput component.
 */
class Pinpad extends React.PureComponent<Props, State> {
  private inputRef: React.RefObject<TextInput>;
  private focusWatcher?: number;
  private onFulfillTimeoutId?: number;

  // Utility array of as many elements as how many digits the pin has.
  // Its map method will be used to render the pin's placeholders.
  private placeholderPositions: ReadonlyArray<undefined>;

  private setFocusWatcher = () => {
    // tslint:disable-next-line:no-object-mutation
    this.focusWatcher = setTimeout(() => {
      if (this.state.value.length < PIN_LENGTH) {
        this.foldInputRef(el => {
          if (!el.isFocused()) {
            el.focus();
            this.setState({
              isFocused: false
            });
          } else {
            this.setState({
              isFocused: true
            });
          }
        });
      }
      this.setFocusWatcher();
    }, 500);
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      value: "",
      isFocused: false
    };

    this.inputRef = React.createRef();
    this.placeholderPositions = [...new Array(PIN_LENGTH)];
  }

  public componentDidMount() {
    this.setFocusWatcher();
  }

  public componentWillUnmount() {
    if (this.focusWatcher) {
      clearTimeout(this.focusWatcher);
    }

    if (this.onFulfillTimeoutId) {
      clearTimeout(this.onFulfillTimeoutId);
    }
  }

  public foldInputRef = (fn: (el: TextInput) => void) =>
    fromNullable(this.inputRef)
      .mapNullable(current)
      .fold(undefined, fn);

  private handleChangeText = (inputValue: string) => {
    this.setState({ value: inputValue });

    // Pin is fulfilled
    if (inputValue.length === PIN_LENGTH) {
      const isValid = inputValue === this.props.compareWithCode;

      if (isValid) {
        this.foldInputRef(blurElement);
      } else {
        if (this.props.clearOnInvalid) {
          this.clear();
        }
      }

      // Fire the callback asynchronously, otherwise this component
      // will be unmounted before the render of the last bullet placeholder.
      // tslint:disable-next-line no-object-mutation
      this.onFulfillTimeoutId = setTimeout(() =>
        this.props.onFulfill(inputValue as PinString, isValid)
      );
    }
  };

  private handlePlaceholderPress = () => this.foldInputRef(focusElement);

  public clear = () => this.setState({ value: "" });

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

  public render() {
    return (
      <React.Fragment>
        <View style={styles.placeholderContainer}>
          {this.placeholderPositions.map(this.renderPlaceholder)}
        </View>
        <TextInput
          ref={this.inputRef}
          // style={styles.input}
          style={{
            backgroundColor: this.state.isFocused ? "#fff" : "#faa",
            height: 50
          }}
          keyboardType="numeric"
          autoFocus={true}
          value={this.state.value}
          onChangeText={this.handleChangeText}
          maxLength={PIN_LENGTH}
          onLayout={() => this.foldInputRef(focusElement)}
        />
      </React.Fragment>
    );
  }
}

export default Pinpad;
