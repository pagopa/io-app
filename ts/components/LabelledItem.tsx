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
import MaskedInput from "../components/ui/MaskedInput";
import variables from "../theme/variables";
import IconFont from "./ui/IconFont";

const styles = StyleSheet.create({
  noBottomLine: {
    borderBottomWidth: 0
  },
  bottomLine: {
    borderBottomWidth: 1
  },
  inputStyle: {
    height: 50,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 17,
    color: "#5C6F82",
    flex: 1
  }
});

type Props = Readonly<{
  label: string;
  icon: string;
  placeholder: string;
  inputProps: TextInputProps;
  mask?: string;
  onChangeText: (value: string) => void;
}>;

export class LabelledItem extends React.Component<Props> {
  public render() {
    return (
      <View>
        <Item style={styles.noBottomLine}>
          <Text>{this.props.label}</Text>
        </Item>
        <Item style={styles.bottomLine}>
          <IconFont
            size={variables.iconSize3}
            color={variables.brandDarkGray}
            name={this.props.icon}
          />
          {this.props.mask ? (
            <MaskedInput
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
              placeholder={this.props.placeholder}
              mask={this.props.mask}
              onChangeText={this.props.onChangeText}
              {...this.props.inputProps}
            />
          ) : (
            <Input
              placeholderTextColor={color(variables.brandGray)
                .darken(0.2)
                .string()}
              placeholder={this.props.placeholder}
              onChangeText={this.props.onChangeText}
              {...this.props.inputProps}
            />
          )}
        </Item>
      </View>
    );
  }
}
