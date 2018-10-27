import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import {
  EmitterSubscription,
  Keyboard,
  TextInput,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  InteractionManager
} from "react-native";

import { PinString } from "../../types/PinString";
import { PIN_LENGTH } from "../../utils/constants";

import { styles } from "./Pinpad.style";
import { Baseline, Bullet } from "./Placeholders";

const focusElement = (el: TextInput) => el.focus();
const blurElement = (el: TextInput) => el.blur();

interface Props {
  activeColor: string;
  clearOnInvalid?: boolean;
  compareWithCode?: string;
  inactiveColor: string;
  onFulfill: (code: PinString, isValid: boolean) => void;
}

interface State {
  value: string;
}

/**
 * A customized CodeInput component.
 */
class Pinpad extends React.PureComponent<Props, State> {
  private textInputRef: React.RefObject<TextInput>;
  private onFulfillTimeoutId?: number;

  // Utility array of as many elements as how many digits the pin has.
  // Its map method will be used to render the pin's placeholders.
  private placeholderPositions: ReadonlyArray<undefined>;

  private keyboardDidHideListener: EmitterSubscription | undefined;

  constructor(props: Props) {
    super(props);

    this.state = {
      value: ""
    };

    this.textInputRef = React.createRef();
    this.placeholderPositions = [...new Array(PIN_LENGTH)];
    this.keyboardDidHideListener = undefined;
  }

  public componentDidMount() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  public componentWillUnmount() {
    if (this.keyboardDidHideListener) {
      console.log("Remove keyboard listener");
      this.keyboardDidHideListener.remove();
      // tslint:disable-next-line:no-object-mutation
      this.keyboardDidHideListener = undefined;
    }

    AppState.removeEventListener("change", this.handleAppStateChange);

    if (this.onFulfillTimeoutId) {
      clearTimeout(this.onFulfillTimeoutId);
    }
  }

  public foldTextInputRef = (fn: (el: TextInput) => void) =>
    fromNullable(this.textInputRef.current).fold(undefined, fn);

  private handleChangeText = (inputValue: string) => {
    this.setState({ value: inputValue });

    // Pin is fulfilled
    if (inputValue.length === PIN_LENGTH) {
      const isValid = inputValue === this.props.compareWithCode;

      if (isValid) {
        this.foldTextInputRef(blurElement);
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

  private handlePlaceholderPress = () => this.foldTextInputRef(focusElement);

  private handleKeyboardDidHide = () => {
    console.log("handleKeyboardDidHide");
    this.foldTextInputRef(blurElement);
  };

  private handleAppStateChange = (newAppStateStatus: AppStateStatus) => {
    if (newAppStateStatus === "active") {
      console.log("Handling active");
      this.foldTextInputRef(focusElement);
    } else {
      console.log("Handling background");
      this.clear();
      this.foldTextInputRef(blurElement);
    }
  };

  private handleFocus = () => {
    console.log("Handling focus");
    if (!this.keyboardDidHideListener) {
      console.log("Add keyboard listener");
      // tslint:disable-next-line:no-object-mutation
      this.keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        this.handleKeyboardDidHide
      );
    }
  };

  private handleBlur = () => {
    console.log("Handling blur");
    if (this.keyboardDidHideListener) {
      console.log("Remove keyboard listener");
      this.keyboardDidHideListener.remove();
      // tslint:disable-next-line:no-object-mutation
      this.keyboardDidHideListener = undefined;
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

  public clear = () => this.setState({ value: "" });

  public render() {
    return (
      <React.Fragment>
        <View style={styles.placeholderContainer}>
          {this.placeholderPositions.map(this.renderPlaceholder)}
        </View>
        <TextInput
          ref={this.textInputRef}
          style={styles.input}
          keyboardType="numeric"
          autoFocus={true}
          value={this.state.value}
          onChangeText={this.handleChangeText}
          maxLength={PIN_LENGTH}
          onFocus={() => {
            console.log("onFocus");
            this.handleFocus();
          }}
          onBlur={() => {
            console.log("onBlur");
            this.handleBlur();
          }}
        />
      </React.Fragment>
    );
  }
}

export default Pinpad;
