import { View } from "native-base";
import * as React from "react";
import BlockButtons, { BlockButtonsProps } from "./BlockButtons";

type OwnProps = Readonly<{
  withSafeArea?: boolean
}>;

export type FooterWithButtonsPorps = OwnProps & BlockButtonsProps;

/**
 * Implements a component that show buttons as sticky footer
 * It can include 1, 2 or 3 buttons. If they are 2, they can have the inlineHalf  or the inlineOneThird style
 */
export default class FooterWithButtons extends React.Component<
  FooterWithButtonsPorps,
  never
> {
  public render() {
    return (
      <View footer={true} withSafeArea={this.props.withSafeArea}>
        <BlockButtons {...this.props} />
      </View>
    );
  }
}
