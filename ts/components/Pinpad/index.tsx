import { ITuple3, Tuple3 } from "italia-ts-commons/lib/tuples";
import { Button, Col, Grid, Row, Text, View } from "native-base";
import * as React from "react";

import I18n from "../../i18n";

import { PinString } from "../../types/PinString";
import { PIN_LENGTH } from "../../utils/constants";

import { styles } from "./Pinpad.style";
import { Baseline, Bullet } from "./Placeholders";

interface Props {
  activeColor: string;
  clearOnInvalid?: boolean;
  compareWithCode?: string;
  inactiveColor: string;
  buttonType: "primary" | "light";
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
      this.onFulfillTimeoutId = setTimeout(
        () => this.props.onFulfill(inputValue as PinString, isValid),
        50
      );
    }
  };

  private handlePinDigit = (digit: number) =>
    this.handleChangeText(`${this.state.value}${digit}`);

  private deleteLastDigit = () =>
    this.setState(prev => ({
      value:
        prev.value.length > 0
          ? prev.value.slice(0, prev.value.length - 1)
          : prev.value
    }));

  private renderPlaceholder = (_: undefined, i: number) => {
    const isPlaceholderPopulated = i <= this.state.value.length - 1;
    const { activeColor, inactiveColor } = this.props;

    return isPlaceholderPopulated ? (
      <Bullet color={activeColor} key={`baseline-${i}`} />
    ) : (
      <Baseline color={inactiveColor} key={`baseline-${i}`} />
    );
  };

  private renderPinCol = (
    digit: number,
    label: string,
    handler: (digit: number) => void,
    style: "digit" | "label"
  ) => {
    return (
      <Col key={`pinpad-digit-${digit}-${label}`}>
        <Button
          onPress={() => handler(digit)}
          style={style === "digit" ? styles.roundButton : {}}
          transparent={style === "label"}
          block={style === "label"}
          primary={this.props.buttonType === "primary"}
          light={this.props.buttonType === "light"}
        >
          <Text
            style={[
              styles.buttonTextBase,
              style === "digit"
                ? styles.buttonTextDigit
                : styles.buttonTextLabel,
              style === "label" && this.props.buttonType === "primary"
                ? {
                    color: "white"
                  }
                : {}
            ]}
          >
            {label}
          </Text>
        </Button>
      </Col>
    );
  };

  private renderPinRow = (
    digits: ReadonlyArray<
      ITuple3<number, string, (digit: number) => void> | undefined
    >
  ) => (
    <Row>
      {digits.map(
        (el, i) =>
          el ? (
            this.renderPinCol(
              el.e1,
              el.e2,
              el.e3,
              el.e2.length === 1 ? "digit" : "label"
            )
          ) : (
            <Col key={`pinpad-empty-${i}`} />
          )
      )}
    </Row>
  );

  public clear = () => this.setState({ value: "" });

  public render() {
    return (
      <React.Fragment>
        <View style={styles.placeholderContainer}>
          {this.placeholderPositions.map(this.renderPlaceholder)}
        </View>
        <View spacer={true} extralarge={true} />
        <Grid>
          {this.renderPinRow([
            Tuple3(1, "1", this.handlePinDigit),
            Tuple3(2, "2", this.handlePinDigit),
            Tuple3(3, "3", this.handlePinDigit)
          ])}
          {this.renderPinRow([
            Tuple3(4, "4", this.handlePinDigit),
            Tuple3(5, "5", this.handlePinDigit),
            Tuple3(6, "6", this.handlePinDigit)
          ])}
          {this.renderPinRow([
            Tuple3(7, "7", this.handlePinDigit),
            Tuple3(8, "8", this.handlePinDigit),
            Tuple3(9, "9", this.handlePinDigit)
          ])}
          {this.renderPinRow([
            this.props.onCancel
              ? Tuple3(
                  0,
                  I18n.t("global.buttons.cancel").toUpperCase(),
                  this.props.onCancel
                )
              : undefined,
            Tuple3(10, "0", this.handlePinDigit),
            Tuple3(11, "<", this.deleteLastDigit)
          ])}
        </Grid>
      </React.Fragment>
    );
  }
}

export default Pinpad;
