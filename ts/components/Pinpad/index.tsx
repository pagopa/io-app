import { range } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { Tuple2 } from "italia-ts-commons/lib/tuples";
import { debounce, shuffle } from "lodash";
import { Text, View } from "native-base";
import * as React from "react";
import { Alert, Dimensions, StyleSheet, ViewStyle } from "react-native";
import I18n from "../../i18n";
import { BiometryPrintableSimpleType } from "../../screens/onboarding/FingerprintScreen";
import { PinString } from "../../types/PinString";
import { ComponentProps } from "../../types/react";
import { PIN_LENGTH, PIN_LENGTH_SIX } from "../../utils/constants";
import { ShakeAnimation } from "../animations/ShakeAnimation";
import { KeyPad } from "./KeyPad";
import { Baseline, Bullet } from "./Placeholders";

interface Props {
  activeColor: string;
  delayOnFailureMillis?: number;
  clearOnInvalid?: boolean;
  shufflePad?: boolean;
  isFingerprintEnabled?: any;
  biometryType?: any;
  compareWithCode?: string;
  inactiveColor: string;
  disabled?: boolean;
  buttonType: ComponentProps<typeof KeyPad>["buttonType"];
  onFulfill: (code: PinString, isValid: boolean) => void;
  onCancel?: () => void;
  onPinResetHandler?: () => void;
  onFingerPrintReq?: () => void;
  onDeleteLastDigit?: () => void;
  remainingAttempts?: number;
}

interface State {
  value: string;
  isDisabled: boolean;
  pinLength: number;
  pinPadValues: ReadonlyArray<string>;
  scalableDimension?: ViewStyle;
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flexDirection: "row",
    justifyContent: "center"
  },
  text: {
    alignSelf: "center",
    justifyContent: "center"
  },
  mediumText: {
    fontSize: 18,
    lineHeight: 21
  }
});

const screenWidth = Dimensions.get("window").width;
// Placeholders values
const width = 36;
const sideMargin = 32;
const margin = 12;

/**
 * A customized CodeInput component.
 */
class Pinpad extends React.PureComponent<Props, State> {
  private onFulfillTimeoutId?: number;
  private onDelayOnFailureTimeoutId?: number;
  private shakeAnimationRef = React.createRef<ShakeAnimation>();

  /**
   * Print the only BiometrySimplePrintableType values that are passed to the UI
   * @param biometrySimplePrintableType
   */
  private renderBiometryType(
    biometryPrintableSimpleType: BiometryPrintableSimpleType
  ): string {
    switch (biometryPrintableSimpleType) {
      case "FINGERPRINT":
        return "fingerprint-onboarding-icon.png";
      case "FACE_ID":
        return "faceid-onboarding-icon.png";
      case "TOUCH_ID":
        return "fingerprint-onboarding-icon.png";
    }
  }

  private deleteLastDigit = () => {
    this.setState(prev => ({
      value:
        prev.value.length > 0
          ? prev.value.slice(0, prev.value.length - 1)
          : prev.value
    }));
    if (this.props.onDeleteLastDigit) {
      this.props.onDeleteLastDigit();
    }
  };

  private pinPadDigits = (): ComponentProps<typeof KeyPad>["digits"] => {
    const { pinPadValues } = this.state;

    return [
      [
        Tuple2(pinPadValues[1], () => this.handlePinDigit(pinPadValues[1])),
        Tuple2(pinPadValues[2], () => this.handlePinDigit(pinPadValues[2])),
        Tuple2(pinPadValues[3], () => this.handlePinDigit(pinPadValues[3]))
      ],
      [
        Tuple2(pinPadValues[4], () => this.handlePinDigit(pinPadValues[4])),
        Tuple2(pinPadValues[5], () => this.handlePinDigit(pinPadValues[5])),
        Tuple2(pinPadValues[6], () => this.handlePinDigit(pinPadValues[6]))
      ],
      [
        Tuple2(pinPadValues[7], () => this.handlePinDigit(pinPadValues[7])),
        Tuple2(pinPadValues[8], () => this.handlePinDigit(pinPadValues[8])),
        Tuple2(pinPadValues[9], () => this.handlePinDigit(pinPadValues[9]))
      ],
      [
        this.props.isFingerprintEnabled &&
        this.props.biometryType &&
        this.props.onFingerPrintReq
          ? Tuple2(
              // set the image name
              this.renderBiometryType(this.props.biometryType),
              this.props.onFingerPrintReq
            )
          : undefined,
        Tuple2(pinPadValues[0], () => this.handlePinDigit(pinPadValues[0])),
        Tuple2("<", this.deleteLastDigit) // TODO: use icon instead
      ]
    ];
  };

  private confirmResetAlert = () =>
    Alert.alert(
      I18n.t("identification.forgetCode.confirmTitle"),
      I18n.t("identification.forgetCode.confirmMsg"),
      [
        {
          text: I18n.t("global.buttons.confirm"),
          style: "default",
          onPress: this.props.onPinResetHandler
        },
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        }
      ],
      { cancelable: false }
    );

  constructor(props: Props) {
    super(props);
    this.state = {
      value: "",
      isDisabled: false,
      pinLength: PIN_LENGTH,
      pinPadValues: range(0, 9).map(s => s.toString()),
      scalableDimension: undefined
    };
  }

  public componentDidMount() {
    const { pinPadValues } = this.state;

    const pinLength =
      this.props.compareWithCode !== undefined
        ? this.props.compareWithCode.length
        : PIN_LENGTH_SIX;

    // we avoid to shuffle pin/code pad in dev env
    const newPinPadValue =
      this.props.shufflePad !== true ? pinPadValues : shuffle(pinPadValues);

    // compute width placeholder
    const totalMargins = margin * 2 * (pinLength - 1) + sideMargin * 2;
    const widthNeeded = width * pinLength + totalMargins;

    const placeholderWidth = (screenWidth - totalMargins) / pinLength;

    const scalableDimension: ViewStyle = {
      width: widthNeeded > screenWidth ? placeholderWidth : width
    };

    this.setState({
      pinLength,
      scalableDimension,
      pinPadValues: newPinPadValue
    });
  }

  public componentWillUnmount() {
    if (this.onFulfillTimeoutId) {
      clearTimeout(this.onFulfillTimeoutId);
    } else if (this.onDelayOnFailureTimeoutId) {
      clearTimeout(this.onDelayOnFailureTimeoutId);
    }
  }

  private handleChangeText = (inputValue: string) => {
    // if the component is disabled don't handle any input
    if (this.props.disabled) {
      return;
    }
    this.setState({ value: inputValue });

    // Pin/code is fulfilled
    if (inputValue.length === this.state.pinLength) {
      const isValid = inputValue === this.props.compareWithCode;

      if (!isValid && this.props.clearOnInvalid) {
        this.debounceClear();
        if (this.props.delayOnFailureMillis) {
          // disable click keypad
          this.setState({
            isDisabled: true
          });

          // re-enable after delayOnFailureMillis milliseconds
          // tslint:disable-next-line: no-object-mutation
          this.onDelayOnFailureTimeoutId = setTimeout(() => {
            this.setState({
              isDisabled: false
            });
          }, this.props.delayOnFailureMillis);
          // start animation 'shake'
          if (this.shakeAnimationRef.current) {
            this.shakeAnimationRef.current.shake();
          }
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

  private handlePinDigit = (digit: string) =>
    this.handleChangeText(`${this.state.value}${digit}`);

  private renderPlaceholder = (i: number) => {
    const isPlaceholderPopulated = i <= this.state.value.length - 1;
    const { activeColor, inactiveColor } = this.props;
    const { scalableDimension } = this.state;

    return isPlaceholderPopulated ? (
      <Bullet
        color={activeColor}
        scalableDimension={scalableDimension}
        key={`baseline-${i}`}
      />
    ) : (
      <Baseline
        color={inactiveColor}
        scalableDimension={scalableDimension}
        key={`baseline-${i}`}
      />
    );
  };

  public debounceClear = debounce(() => {
    this.setState({ value: "" });
  }, 100);

  private renderRemainingAttempts = (remainingAttempts: number) => {
    const wrongCode = I18n.t("identification.fail.wrongCode");
    const remainingAttemptsString = I18n.t(
      remainingAttempts > 1
        ? "identification.fail.remainingAttempts"
        : "identification.fail.remainingAttemptSingle",
      { attempts: remainingAttempts }
    );

    return (
      <Text primary={true} style={styles.text} bold={true}>
        {wrongCode}. {remainingAttemptsString}
      </Text>
    );
  };

  public render() {
    const placeholderPositions = range(0, this.state.pinLength - 1);
    const remainingAttemptsMessage = fromNullable(
      this.props.remainingAttempts
    ).fold(null, x => this.renderRemainingAttempts(x));

    return (
      <React.Fragment>
        <View style={styles.placeholderContainer}>
          {placeholderPositions.map(this.renderPlaceholder)}
        </View>
        <View spacer={true} />
        {remainingAttemptsMessage}
        {this.props.onPinResetHandler !== undefined && (
          <React.Fragment>
            <Text
              white={this.props.buttonType === "primary"}
              onPress={this.confirmResetAlert}
              style={styles.text}
            >
              {`${I18n.t("identification.unlockCode.reset.button")} `}
              <Text
                underlined={true}
                white={this.props.buttonType === "primary"}
              >
                {I18n.t("identification.unlockCode.reset.code")}
              </Text>
              <Text white={this.props.buttonType === "primary"}>
                {I18n.t("global.symbols.question")}
              </Text>
            </Text>
            <View spacer={true} />
          </React.Fragment>
        )}
        <View spacer={true} />
        <ShakeAnimation duration={600} ref={this.shakeAnimationRef}>
          <KeyPad
            digits={this.pinPadDigits()}
            buttonType={this.props.buttonType}
            isDisabled={this.state.isDisabled}
          />
        </ShakeAnimation>
        {this.props.onCancel && (
          <React.Fragment>
            <View spacer={true} large={true} />
            <Text
              style={styles.mediumText}
              alignCenter={true}
              link={true}
              onPress={this.props.onCancel}
            >
              {I18n.t("global.buttons.cancel")}
            </Text>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default Pinpad;
