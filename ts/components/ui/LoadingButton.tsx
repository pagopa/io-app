import { Button, Spinner } from "native-base";
import React, { ComponentProps } from "react";

type Props = ComponentProps<typeof Button>;

/**
 * A button with a loading spinner inside.
 */
class LoadingButton extends React.PureComponent<Props> {
  public render() {
    return (
      <Button {...this.props}>
        <Spinner />
      </Button>
    );
  }
}

export default LoadingButton;
