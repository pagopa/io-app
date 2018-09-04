/**
 * Adds a contextual help (components/ContextualHelp)
 * to a component
 */
import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ContextualHelp } from "../ContextualHelp";

type State = {
  isHelpVisible: boolean;
};

export type ContextualHelpInjectedProps = {
  showHelp: () => void;
};

const styles = StyleSheet.create({
  fullSize: {
    width: "100%",
    height: "100%"
  }
});

/**
 * Adds the methods for showing/hiding the contextual
 * help modal. The methods are made available through
 * the props showHelp, hideHelp and isHelpVisible
 * @param WrappedComponent Component using the ContextualHelp
 */
export function withContextualHelp<P extends ContextualHelpInjectedProps>(
  WrappedComponent: React.ComponentType<P>,
  title: string,
  body: () => React.ReactNode
) {
  return class extends React.Component<P, State> {
    constructor(props: P) {
      super(props);
      this.state = {
        isHelpVisible: false
      };
    }

    public showHelp = () => {
      this.setState({ isHelpVisible: true });
    };

    public hideHelp = () => {
      this.setState({ isHelpVisible: false });
    };

    public render() {
      const injectedProps = {
        showHelp: this.showHelp
      };
      return (
        <View style={styles.fullSize}>
          <WrappedComponent {...this.props} {...injectedProps} />
          <ContextualHelp
            title={title}
            body={body}
            isVisible={this.state.isHelpVisible}
            close={this.hideHelp}
          />
        </View>
      );
    }
  };
}
