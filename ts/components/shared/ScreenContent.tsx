import { Content } from "native-base";
import React, { ComponentPropsWithRef } from "react";

type Props = ComponentPropsWithRef<typeof Content>;

class ScreenContent extends React.Component<Props> {
  public render() {
    const { noPadded } = this.props;

    return <Content padder={!noPadded} {...this.props} />;
  }
}

export default ScreenContent;
