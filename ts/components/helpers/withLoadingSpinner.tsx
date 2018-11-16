import hoistNonReactStatics from "hoist-non-react-statics";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { RefreshIndicator } from "../ui/RefreshIndicator";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    opacity: 0.7,
    zIndex: 1,
    justifyContent: "center"
  },
  back: {
    zIndex: 0
  }
});

/**
 * A HOC to display and overlay spinner conditionally
 *
 * @param WrappedComponent The react component you want to wrap
 * @param spinnerProps Props to pass to the spinner component
 */
export function withLoadingSpinner<P extends Readonly<{ isLoading: boolean }>>(
  WrappedComponent: React.ComponentType<P>
) {
  class WithLoadingSpinner extends React.Component<P> {
    public render() {
      const { isLoading } = this.props;
      return (
        <View style={styles.container}>
          {isLoading && (
            <View style={styles.overlay}>
              <RefreshIndicator />
            </View>
          )}
          <View style={[styles.container, styles.back]}>
            <WrappedComponent {...this.props} />
          </View>
        </View>
      );
    }
  }
  hoistNonReactStatics(WithLoadingSpinner, WrappedComponent);

  return WithLoadingSpinner;
}
