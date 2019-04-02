import React from "react";
import FlagSecure from "react-native-flag-secure-android";

type Props = {
  isFlagSecureEnabled: boolean;
};

/**
 * On Android, it enables or disables FLAG_SECURE based on the isFlagSecureEnabled prop.
 */
class FlagSecureComponent extends React.PureComponent<Props> {
  public render() {
    return null;
  }

  public componentDidMount() {
    // Enable FLAG_SECURE when requested.
    if (this.props.isFlagSecureEnabled) {
      FlagSecure.activate();
    }
  }

  public componentDidUpdate() {
    // When isFlagSecureEnabled property changes we need update FLAG_SECURE.
    this.props.isFlagSecureEnabled
      ? FlagSecure.activate()
      : FlagSecure.deactivate();
  }
}

export default FlagSecureComponent;
