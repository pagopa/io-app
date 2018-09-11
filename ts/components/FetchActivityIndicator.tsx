import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import ActivityIndicator from "./ui/activityIndicator";

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
  isVisible: boolean;
};

export class FetchActivityIndicator extends React.PureComponent<Props, never> {
  public render() {
    const { isVisible } = this.props;

    return (
      isVisible && (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator />
        </View>
      )
    );
  }
}

export default FetchActivityIndicator;
