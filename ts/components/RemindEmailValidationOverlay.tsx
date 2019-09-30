/**
 * A component to remind the user to validate it email
 */

import * as React from "react";
import TopScreenComponent from "./screens/TopScreenComponent";

type Props = {
  onClose: () => void;
};

export default class RemindEmailValidationOverlay extends React.PureComponent<
  Props
> {
  public render() {
    return (
      <TopScreenComponent
        customRightIcon={{
          iconName: "io-close",
          onPress: this.props.onClose
        }}
      />
    );
  }
}
