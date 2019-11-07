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
import { TextInputMaskProps } from "react-native-text-input-mask";
import { IconProps } from "react-native-vector-icons/Icon";
import MaskedInput from "../components/ui/MaskedInput";
import variables from "../theme/variables";
import IconFont from "./ui/IconFont";

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
}>;

type Props = CommonProp &
  (
    | Readonly<{
        type: "masked";
        inputMaskProps: TextInputMaskProps;
      }>
    | Readonly<{
        type: "text";
        inputProps: TextInputProps;
      }>);

export class LabelledItem extends React.Component<Props> {
  public render() {
    return (
      <View>
        <Item style={styles.noBottomLine}>
          <Text>{this.props.label}</Text>
        </Item>
        <Item
          style={styles.bottomLine}
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
            <MaskedInput
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
              underlineColorAndroid="transparent"
              {...this.props.inputMaskProps}
            />
          ) : (
            <Input
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
              underlineColorAndroid="transparent"
              {...this.props.inputProps}
            />
          )}
        </Item>
      </View>
    );
  }
}
