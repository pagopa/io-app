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
import { Input, Item, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, TextInputProps } from "react-native";
import { TextInputMaskProps } from "react-native-masked-text";
import { IconProps } from "react-native-vector-icons/Icon";
import variables from "../theme/variables";
import IconFont from "./ui/IconFont";
import TextInputMask from "./ui/MaskedInput";

const styles = StyleSheet.create({
  noBottomLine: {
    borderBottomWidth: 0
  },
  bottomLine: {
    borderBottomWidth: 1
  }
});

type StyleType = IconProps["style"];

type CommonProp = Readonly<{
  label: string;
  icon: string;
  isValid?: boolean;
  iconStyle?: StyleType;
  focusBorderColor?: string;
}>;

type State = {
  isEmpty: boolean;
  hasFocus: boolean;
};

type Props = CommonProp &
  (
    | Readonly<{
        type: "masked";
        inputMaskProps: TextInputMaskProps &
          React.ComponentPropsWithRef<typeof TextInputMask>;
      }>
    | Readonly<{
        type: "text";
        inputProps: TextInputProps;
      }>);

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
          <Text>{this.props.label}</Text>
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
          <IconFont
            size={variables.iconSize3}
            color={variables.brandDarkGray}
            name={this.props.icon}
            style={this.props.iconStyle}
          />
          {this.props.type === "masked" ? (
            <TextInputMask
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
              underlineColorAndroid="transparent"
              {...this.props.inputMaskProps}
              onChangeText={this.handleOnMaskedChangeText}
              onFocus={this.handleOnFocus}
              onBlur={this.handleOnBlur}
            />
          ) : (
            <Input
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
              underlineColorAndroid="transparent"
              {...this.props.inputProps}
              onChangeText={this.handleOnChangeText}
              onFocus={this.handleOnFocus}
              onBlur={this.handleOnBlur}
            />
          )}
        </Item>
      </View>
    );
  }
}
