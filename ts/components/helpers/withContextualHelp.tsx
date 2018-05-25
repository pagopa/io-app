/**
 * Adds a contextual help (components/ContextualHelp)
 * to a component
 */
import * as React from "react";

type State = {
  isHelpVisible: boolean;
};

export type ContextualHelpInjectedProps = {
  showHelp: () => void;
  hideHelp: () => void;
  isHelpVisible: boolean;
};

/**
 * Adds the methods for showing/hiding the contextual
 * help modal. The methods are made available through
 * the props showHelp, hideHelp and isHelpVisible
 * @param WrappedComponent Component using the ContextualHelp
 */
export function withContextualHelp<P extends ContextualHelpInjectedProps>(
  WrappedComponent: React.ComponentType<P>
) {
  // WIP this class is parked here atm, but it will be moved to
  // its own file soon (disable-line to temporarely suppress max-classes-per-file)
  return class extends React.Component<P, State> { // tslint:disable-line
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
        showHelp: this.showHelp,
        hideHelp: this.hideHelp,
        isHelpVisible: this.state.isHelpVisible
      };
      return <WrappedComponent {...this.props} {...injectedProps} />;
    }
  };
}
