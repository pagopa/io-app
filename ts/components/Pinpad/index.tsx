import { Tuple2 } from "italia-ts-commons/lib/tuples";
import { View } from "native-base";
import * as React from "react";

import I18n from "../../i18n";
import { ComponentProps } from "../../types/react";

import { PinString } from "../../types/PinString";
import { PIN_LENGTH } from "../../utils/constants";

import { KeyPad } from "./KeyPad";
import { styles } from "./Pinpad.style";
import { Baseline, Bullet } from "./Placeholders";

interface Props {
  activeColor: string;
  clearOnInvalid?: boolean;
  compareWithCode?: string;
  inactiveColor: string;
  buttonType: ComponentProps<typeof KeyPad>["buttonType"];
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
  private onFulfillTimeoutId?: number;

  // Utility array of as many elements as how many digits the pin has.
  // Its map method will be used to render the pin's placeholders.
  private placeholderPositions: ReadonlyArray<undefined>;

  private deleteLastDigit = () =>
    this.setState(prev => ({
      value:
        prev.value.length > 0
          ? prev.value.slice(0, prev.value.length - 1)
          : prev.value
    }));

  private pinPadDigits: ComponentProps<typeof KeyPad>["digits"] = [
    [
      Tuple2("1", () => this.handlePinDigit("1")),
      Tuple2("2", () => this.handlePinDigit("2")),
      Tuple2("3", () => this.handlePinDigit("3"))
    ],
    [
      Tuple2("4", () => this.handlePinDigit("4")),
      Tuple2("5", () => this.handlePinDigit("5")),
      Tuple2("6", () => this.handlePinDigit("6"))
    ],
    [
      Tuple2("7", () => this.handlePinDigit("7")),
      Tuple2("8", () => this.handlePinDigit("8")),
      Tuple2("9", () => this.handlePinDigit("9"))
    ],
    [
      this.props.onCancel
        ? Tuple2(
            I18n.t("global.buttons.cancel").toUpperCase(),
            this.props.onCancel
          )
        : undefined,
      Tuple2("0", () => this.handlePinDigit("0")),
      Tuple2("<", this.deleteLastDigit)
    ]
  ];

  constructor(props: Props) {
    super(props);

    this.state = {
      value: ""
    };

    this.placeholderPositions = [...new Array(PIN_LENGTH)];
  }

  public componentWillUnmount() {
    if (this.onFulfillTimeoutId) {
      clearTimeout(this.onFulfillTimeoutId);
    }
  }

  private handleChangeText = (inputValue: string) => {
    this.setState({ value: inputValue });

    // Pin is fulfilled
    if (inputValue.length === PIN_LENGTH) {
      const isValid = inputValue === this.props.compareWithCode;

      if (!isValid && this.props.clearOnInvalid) {
        this.clear();
      }

      // Fire the callback asynchronously, otherwise this component
      // will be unmounted before the render of the last bullet placeholder.
      // tslint:disable-next-line no-object-mutation
      this.onFulfillTimeoutId = setTimeout(() =>
        this.props.onFulfill(inputValue as PinString, isValid)
      );
    }
  };

  private handlePinDigit = (digit: string) =>
    this.handleChangeText(`${this.state.value}${digit}`);

  private renderPlaceholder = (_: undefined, i: number) => {
    const isPlaceholderPopulated = i <= this.state.value.length - 1;
    const { activeColor, inactiveColor } = this.props;

    return isPlaceholderPopulated ? (
      <Bullet color={activeColor} key={`baseline-${i}`} />
    ) : (
      <Baseline color={inactiveColor} key={`baseline-${i}`} />
    );
  };

  public clear = () => this.setState({ value: "" });

  public render() {
    return (
      <React.Fragment>
        <View style={styles.placeholderContainer}>
          {this.placeholderPositions.map(this.renderPlaceholder)}
        </View>
        <View spacer={true} extralarge={true} />
        <KeyPad digits={this.pinPadDigits} buttonType={this.props.buttonType} />
      </React.Fragment>
    );
  }
}

export default Pinpad;
