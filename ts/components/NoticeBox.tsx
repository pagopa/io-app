import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { IconProps } from "react-native-vector-icons/Icon";

import IconFont from "./ui/IconFont";

type Props = {
  backgroundColor: string;
  iconProps: IconProps;
};

const styles = StyleSheet.create({
  mainWrapper: {
    borderRadius: 8,
    padding: 20
  },

  messageWrapper: {
    alignItems: "flex-start",
    justifyContent: "center"
  },

  iconWrapper: {
    alignItems: "flex-end",
    justifyContent: "center"
  }
});

class NoticeBox extends React.PureComponent<Props> {
  public render() {
    const { backgroundColor, iconProps } = this.props;
    return (
      <Grid style={[styles.mainWrapper, { backgroundColor }]}>
        <Col size={10} style={styles.messageWrapper}>
          {this.props.children}
        </Col>
        <Col size={2} style={styles.iconWrapper}>
          <IconFont {...iconProps} />
        </Col>
      </Grid>
    );
  }
}

export default NoticeBox;
