import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";

import IconFont from "./ui/IconFont";

type Props = {
  backgroundColor: string;
  iconProps: IconProps;
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 8,
    padding: 20
  },

  messageWrapper: {
    paddingRight: 20,
    alignItems: "flex-end",
    justifyContent: "center"
  },

  iconWrapper: {
    marginRight: 12,
    alignItems: "flex-start",
    justifyContent: "flex-start"
  }
});

class NoticeBox extends React.PureComponent<Props> {
  public render() {
    const { backgroundColor, iconProps } = this.props;
    return (
      <View style={[styles.mainWrapper, { backgroundColor }]}>
        <View style={styles.iconWrapper}>
          <IconFont {...iconProps} />
        </View>
        <View style={styles.messageWrapper}>{this.props.children}</View>
      </View>
    );
  }
}

export default NoticeBox;
