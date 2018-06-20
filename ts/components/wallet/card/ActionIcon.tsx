/**
 * Component that renders an icon from the
 * icon font and wraps it with a touchable
 * highlight (thus allowing onPress actions)
 */
import * as React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native";
import Icon from "../../../theme/font-icons/io-icon-font/index";
import variables from "../../../theme/variables";

type Props = Readonly<{
  name: string;
  size?: number;
}>;

const styles = StyleSheet.create({
  iconWrapper: {
    paddingLeft: 10
  }
});

export default class ActionIcon extends React.Component<Props> {
  public static defaultProps: Partial<Props> = {
    size: variables.iconSizeBase
  };

  public render() {
    return (
      <View style={styles.iconWrapper}>
        <Icon
          name={this.props.name}
          color={variables.brandPrimary}
          size={this.props.size}
        />
      </View>
    );
  }
}
