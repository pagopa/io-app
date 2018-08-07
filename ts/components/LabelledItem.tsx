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

type Props = Readonly<{
  label: string;
  icon: string;
  placeholder: string;
  inputProps: TextInputProps;
}>;

export const LabelledItem: React.SFC<Props> = props => (
  <View>
    <Item style={styles.noBottomLine}>
      <Text>{props.label}</Text>
    </Item>
    <Item style={styles.bottomLine}>
      <IconFont
        size={variables.iconSize3}
        color={variables.brandDarkGray}
        name={props.icon}
      />
      <Input
        placeholderTextColor={color(variables.brandGray)
          .darken(0.2)
          .string()}
        placeholder={props.placeholder}
        {...props.inputProps}
      />
    </Item>
  </View>
);
