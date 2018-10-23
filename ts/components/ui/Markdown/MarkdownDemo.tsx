import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";

import variables from "../../../theme/variables";
import { ComponentProps } from "../../../types/react";
import IconFont from "../../ui/IconFont";

type Props = ComponentProps<View>;

const styles = StyleSheet.create({
  textColumn: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingRight: 5
  },
  iconColumn: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end"
  }
});

class MarkdownDemo extends React.PureComponent<Props, never> {
  public render() {
    return (
      <View {...this.props}>
        <Grid>
          <Col size={10} style={styles.textColumn}>
            {this.props.children}
          </Col>
          <Col size={2} style={styles.iconColumn}>
            <IconFont name="io-test" size={variables.iconSize6} />
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
