/**
 * Display a labelled, followed by a
 * input and an icon on the left-end
 * side of the input
 *
 * LABEL
 * X __________
 * ^     ^
 * icon  |
 *       input
 */
import color from "color";
import I18n from "i18n-js";
import { isString } from "lodash";
import { Input, Item, View } from "native-base";
import * as React from "react";
import {
  StyleSheet,
  TextInputProps,
  Image,
  ImageSourcePropType,
  ImageStyle
} from "react-native";
import { TextInputMaskProps } from "react-native-masked-text";
import { IconProps } from "react-native-vector-icons/Icon";
import variables from "../theme/variables";
import { WithTestID } from "../types/WithTestID";
import { makeFontStyleObject } from "./core/fonts";
import { H5 } from "./core/typography/H5";
import IconFont from "./ui/IconFont";
import TextInputMask from "./ui/MaskedInput";

const styles = StyleSheet.create({
  noBottomLine: {
    borderBottomWidth: 0
  },
  bottomLine: {
    borderBottomWidth: 1
  },
  textInputMask: {
    ...makeFontStyleObject("Regular")
  }
});

// Style type must be generalized so as to support both text icons and image icons
type StyleType = IconProps["style"] & ImageStyle;

type CommonProp = Readonly<{
  label: string;
  icon?: string | ImageSourcePropType;
  isValid?: boolean;
  iconStyle?: StyleType;
  focusBorderColor?: string;
  description?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}>;

type State = {
  isEmpty: boolean;
  hasFocus: boolean;
};

type Props = WithTestID<CommonProp> &
  (
    | Readonly<{
        type: "masked";
        inputMaskProps: TextInputMaskProps &
          React.ComponentPropsWithRef<typeof TextInputMask>;
      }>
    | Readonly<{
        type: "text";
        inputProps: TextInputProps;
      }>
  );

export class LabelledItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isEmpty: true, hasFocus: false };
  }

  /**
   * check if the input is empty and set the value in the state
   */
  private checkInputIsEmpty = (text?: string) => {
    const isEmpty = text === undefined || text.length === 0;
    if (isEmpty !== this.state.isEmpty) {
      this.setState({ isEmpty });
    }
  };

  /**
   * handle input on change text
   */
  private handleOnChangeText = (text: string) => {
    if (this.props.type === "text" && this.props.inputProps.onChangeText) {
      this.props.inputProps.onChangeText(text);
    }
    this.checkInputIsEmpty(text);
  };

  /**
   * handle masked input on change text
   */
  private handleOnMaskedChangeText = (formatted: string, text?: string) => {
    if (
      this.props.type === "masked" &&
      this.props.inputMaskProps.onChangeText
    ) {
      this.props.inputMaskProps.onChangeText(formatted, text);
    }
    this.checkInputIsEmpty(text);
  };

  /**
   * keep track if input (or masked input) gains focus
   */
  private handleOnFocus = () => {
    this.setState({ hasFocus: true });
  };

  /**
   * keep track if input (or masked input) loses focus
   */
  private handleOnBlur = () => {
    this.setState({ hasFocus: false });
  };

  public render() {
    return (
      <View>
        <Item style={styles.noBottomLine}>
          <H5
            accessibilityRole="header"
            accessibilityLabel={`${this.props.label}, ${I18n.t(
              "global.accessibility.inputLabel"
            )}`}
          >
            {this.props.label}
          </H5>
        </Item>
        <Item
          style={{
            ...styles.bottomLine,
            borderColor:
              this.state.hasFocus && this.state.isEmpty
                ? variables.itemBorderDefaultColor
                : this.props.focusBorderColor
          }}
          error={this.props.isValid === undefined ? false : !this.props.isValid}
          success={
            this.props.isValid === undefined ? false : this.props.isValid
          }
        >
          {this.props.icon &&
            (isString(this.props.icon) ? (
              <IconFont
                size={variables.iconSize3}
                color={variables.brandDarkGray}
                name={this.props.icon}
                style={this.props.iconStyle}
              />
            ) : (
              <Image source={this.props.icon} style={this.props.iconStyle} />
            ))}
          {this.props.type === "masked" ? (
            <TextInputMask
              accessibilityLabel={this.props.accessibilityLabel}
              accessibilityHint={`${this.props.accessibilityHint}${
                this.props.description ? "," + this.props.description : ""
              }`}
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
              underlineColorAndroid="transparent"
              {...this.props.inputMaskProps}
              onChangeText={this.handleOnMaskedChangeText}
              onFocus={this.handleOnFocus}
              onBlur={this.handleOnBlur}
              testID={`${this.props.testID}InputMask`}
              style={styles.textInputMask}
            />
          ) : (
            <Input
              accessibilityLabel={this.props.accessibilityLabel}
              accessibilityHint={`${this.props.accessibilityHint}${
                this.props.description ? "," + this.props.description : ""
              }`}
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
              underlineColorAndroid="transparent"
              {...this.props.inputProps}
              onChangeText={this.handleOnChangeText}
              onFocus={this.handleOnFocus}
              onBlur={this.handleOnBlur}
              testID={`${this.props.testID}Input`}
            />
          )}
        </Item>
        {this.props.description && (
          <View importantForAccessibility="no-hide-descendants">
            <Item style={styles.noBottomLine}>
              <H5
                weight={"Regular"}
                color={this.props.isValid === false ? "red" : "bluegreyDark"}
              >
                {this.props.description}
              </H5>
            </Item>
          </View>
        )}
      </View>
    );
  }
}
