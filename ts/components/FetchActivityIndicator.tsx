import { View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import variables from "../theme/variables";

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }
});

export type Props = {
  show: boolean;
};

export class FetchActivityIndicator extends React.PureComponent<Props, never> {
  public render() {
    const { show } = this.props;

    return (
      show && (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size={"large"} color={variables.brandPrimary} />
        </View>
      )
    );
  }
}

export default FetchActivityIndicator;
