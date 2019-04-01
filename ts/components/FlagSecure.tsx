import React from "react";
import FlagSecure from "react-native-flag-secure-android";

type Props = {
  isFlagSecureEnabled: boolean;
};

class FlagSecureComponent extends React.PureComponent<Props> {
  public render() {
    return null;
  }

  public componentDidMount() {
    if (this.props.isFlagSecureEnabled) {
      // Activate FLAG_SECURE only when debug mode is disabled.
      FlagSecure.activate();
    }
  }

  public componentDidUpdate() {
    // Activate FLAG_SECURE only when debug mode is disabled.
    this.props.isFlagSecureEnabled
      ? FlagSecure.activate()
      : FlagSecure.deactivate();
  }
}

export default FlagSecureComponent;
