import { fromNullable } from "fp-ts/lib/Option";
import { ITuple3, Tuple3 } from "italia-ts-commons/lib/tuples";
import { Button, Col, Grid, Row, Text, View } from "native-base";
import * as React from "react";
import {
  EmitterSubscription,
  Keyboard,
  TextInput,
  TouchableOpacity
} from "react-native";

import I18n from "../../i18n";

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
  onCancel?: () => void;
}

interface State {
  value: string;
}

/**
 * A customized CodeInput component.
 */
class Pinpad extends React.PureComponent<Props, State> {
  private inputRef: React.RefObject<TextInput>;
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

    this.inputRef = React.createRef();
    this.placeholderPositions = [...new Array(PIN_LENGTH)];
    this.keyboardDidHideListener = undefined;
  }

  public componentDidMount() {
    // tslint:disable-next-line no-object-mutation
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this.handleKeyboardDidHide
    );
  }

  public componentWillUnmount() {
    if (this.keyboardDidHideListener) {
      this.keyboardDidHideListener.remove();
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

  private handlePinDigit = (digit: number) =>
    this.handleChangeText(`${this.state.value}${digit}`);

  private handlePlaceholderPress = () => this.foldInputRef(focusElement);

  private handleKeyboardDidHide = () => this.foldInputRef(blurElement);

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

  private renderPinCol = (
    digit: number,
    label: string,
    handler: (digit: number) => void,
    style: "normal" | "small"
  ) => (
    <Col>
      <Button
        onPress={() => handler(digit)}
        style={{ height: 65 }}
        transparent={true}
        block={true}
      >
        <Text
          style={{
            color: this.props.activeColor,
            fontSize: style === "normal" ? 50 : 20,
            lineHeight: 60
          }}
        >
          {label}
        </Text>
      </Button>
    </Col>
  );

  private renderPinRow = (
    digits: ReadonlyArray<
      ITuple3<number, string, (digit: number) => void> | undefined
    >
  ) => (
    <Row>
      {digits.map(
        el =>
          el ? (
            this.renderPinCol(
              el.e1,
              el.e2,
              el.e3,
              el.e2.length > 1 ? "small" : "normal"
            )
          ) : (
            <Col />
          )
      )}
    </Row>
  );

  public render() {
    return (
      <React.Fragment>
        <View style={styles.placeholderContainer}>
          {this.placeholderPositions.map(this.renderPlaceholder)}
        </View>
        <View spacer={true} large={true} />
        <Grid>
          {this.renderPinRow([
            Tuple3(1, "①", this.handlePinDigit),
            Tuple3(2, "②", this.handlePinDigit),
            Tuple3(3, "③", this.handlePinDigit)
          ])}
          {this.renderPinRow([
            Tuple3(4, "④", this.handlePinDigit),
            Tuple3(5, "⑤", this.handlePinDigit),
            Tuple3(6, "⑥", this.handlePinDigit)
          ])}
          {this.renderPinRow([
            Tuple3(7, "⑦", this.handlePinDigit),
            Tuple3(8, "⑧", this.handlePinDigit),
            Tuple3(9, "⑨", this.handlePinDigit)
          ])}
          {this.renderPinRow([
            this.props.onCancel
              ? Tuple3(0, I18n.t("global.buttons.cancel"), this.props.onCancel)
              : undefined,
            Tuple3(0, "⓪", this.handlePinDigit),
            Tuple3(0, "✕", this.clear)
          ])}
        </Grid>
      </React.Fragment>
    );
  }
}

export default Pinpad;
