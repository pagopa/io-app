import { Content } from "native-base";
import React, { ComponentPropsWithRef } from "react";

type Props = ComponentPropsWithRef<typeof Content>;

/**
 * Wrapper for the native-base Content component that
 * properly sets default content padding.
 */
class ScreenContent extends React.Component<Props> {
  public render() {
    const { noPadded } = this.props;

    return <Content padder={!noPadded} {...this.props} />;
  }
}

export default ScreenContent;
