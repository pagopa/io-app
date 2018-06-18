/**
 * Component that renders an icon from the
 * icon font and wraps it with a touchable
 * highlight (thus allowing onPress actions)
 */
import * as React from "react";
import { View } from "react-native";
import { StyleSheet, TouchableHighlight } from "react-native";
import Icon from "../../../theme/font-icons/io-icon-font/index";
import variables from "../../../theme/variables";

type Props = Readonly<{
  name: string;
  onPress?: () => void;
  size?: number;
  touchable?: boolean;
}>;

const styles = StyleSheet.create({
  iconWrapper: {
    paddingLeft: 10
  }
});

export class ActionIcon extends React.Component<Props> {
  public static defaultProps = {
    size: variables.iconSizeBase,
    touchable: true
  };

  public render() {
    const { onPress } = this.props;
    const icon = (
      <Icon
        name={this.props.name}
        color={variables.brandPrimary}
        size={this.props.size}
      />
    );
    return this.props.touchable ? (
      <TouchableHighlight
        style={styles.iconWrapper}
        onPress={onPress === undefined ? undefined : onPress}
      >
        {icon}
      </TouchableHighlight>
    ) : (
      <View style={styles.iconWrapper}>{icon}</View>
    );
  }
}
