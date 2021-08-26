import { Badge, Text } from "native-base";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  badgeStyle: StyleProp<ViewStyle>;
  textStyle: StyleProp<ViewStyle>;
  badgeValue: number;
};

const MAX_BADGE_VALUE = 99;

/**
 * A simple badge used for show the number of messages to read
 *
 */
export default class CustomBadge extends React.PureComponent<Props> {
  public render() {
    return (
      this.props.badgeValue > 0 && (
        <Badge style={this.props.badgeStyle}>
          <Text
            badge={true}
            style={this.props.textStyle}
            accessible={false}
            importantForAccessibility={"no-hide-descendants"}
          >
            {Math.min(this.props.badgeValue, MAX_BADGE_VALUE)}
          </Text>
        </Badge>
      )
    );
  }
}
