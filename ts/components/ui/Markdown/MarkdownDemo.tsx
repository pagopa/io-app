import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";

import { ComponentProps } from "../../../types/react";
import IconFont from "../../ui/IconFont";

type Props = ComponentProps<View>;

const styles = StyleSheet.create({
  textColumn: {
    paddingRight: 10
  },
  iconColumn: {
    flexDirection: "row",
    alignItems: "center"
  }
});

class MarkdownDemo extends React.PureComponent<Props, never> {
  public render() {
    return (
      <View {...this.props}>
        <Grid>
          <Col size={11} style={styles.textColumn}>
            {this.props.children}
          </Col>
          <Col size={1} style={styles.iconColumn}>
            <IconFont name="io-notice" />
          </Col>
        </Grid>
      </View>
    );
  }
}
export default connectStyle(
  "UIComponent.MarkdownDemo",
  {},
  mapPropsToStyleNames
)(MarkdownDemo);
