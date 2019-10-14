import { Badge, Text } from "native-base";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  badgeStyle: StyleProp<ViewStyle>;
  textStyle: StyleProp<ViewStyle>;
  badgeValue: number;
};

export default class CustomBadge extends React.PureComponent<Props> {
  public render() {
    return (
      this.props.badgeValue > 0 && (
        <Badge style={this.props.badgeStyle}>
          <Text badge={true} style={this.props.textStyle}>
            {this.props.badgeValue}
          </Text>
        </Badge>
      )
    );
  }
}
