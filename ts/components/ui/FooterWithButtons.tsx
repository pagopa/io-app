import { View } from "native-base";
import * as React from "react";
import BlockButtons, { BlockButtonsProps } from "./BlockButtons";

/**
 * Implements a component that show buttons as sticky footer
 * It can include 1, 2 or 3 buttons. If they are 2, they can have the inlineHalf  or the inlineOneThird style
 */
export default class FooterWithButtons extends React.Component<
  BlockButtonsProps,
  never
> {
  public render() {
    return (
      <View footer={true}>
        <BlockButtons {...this.props} />
      </View>
    );
  }
}
