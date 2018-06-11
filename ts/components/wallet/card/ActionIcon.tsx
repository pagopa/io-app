import * as React from "react";
import { StyleSheet, TouchableHighlight } from "react-native";
import Icon from "../../../theme/font-icons/io-icon-font/index";
import variables from "../../../theme/variables";

type Props = Readonly<{
  name: string;
  onPress?: () => void;
  size?: number;
}>;

const styles = StyleSheet.create({
  iconWrapper: {
    paddingLeft: 10
  }
});

export class ActionIcon extends React.Component<Props> {
  public static defaultProps = {
    size: variables.iconSizeBase
  };

  public render() {
    const { onPress } = this.props;
    return (
      <TouchableHighlight
        style={styles.iconWrapper}
        onPress={onPress === undefined ? undefined : onPress}
      >
        <Icon
          name={this.props.name}
          color={variables.brandPrimary}
          size={this.props.size}
        />
      </TouchableHighlight>
    );
  }
}
