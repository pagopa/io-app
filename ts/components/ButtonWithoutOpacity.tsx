import { Button } from "native-base";
import * as React from "react";

class ButtonWithoutOpacity extends Button {
  public render() {
    return <Button {...this.props} activeOpacity={1} />;
  }
}

export default ButtonWithoutOpacity;
