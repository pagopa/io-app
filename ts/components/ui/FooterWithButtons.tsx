import { Button, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ComponentProps } from "../../types/react";

type OwnButtonProps = {
  title: string;
};

type FooterButtonProps = ComponentProps<Button> & OwnButtonProps;

type Props = Readonly<{
  leftButton: FooterButtonProps;
  rightButton: FooterButtonProps;
  inlineHalf?: true;
  inlineOneThird?: true;
}>;

/**
 * Implements a component that show 2 buttons in footer with select style (inlineHalf | inlineOneThird)
 */
class FooterWithButtons extends React.Component<Props> {
  public render() {
    const {
      title: leftButtonTitle,
      ...otherPropsLeftButton
    } = this.props.leftButton;
    const {
      title: rightButtonTitle,
      ...otherPropsRightButton
    } = this.props.rightButton;

    return (
      <View footer={true}>
        <Button {...otherPropsLeftButton}>
          <Text>{leftButtonTitle}</Text>
        </Button>
        {this.props.inlineHalf || this.props.inlineOneThird ? (
          <View hspacer={true} />
        ) : (
          <View spacer={true} />
        )}
        <Button {...otherPropsRightButton}>
          <Text>{rightButtonTitle}</Text>
        </Button>
      </View>
    );
  }
}

export default connectStyle(
  "UIComponent.FooterWithButtons",
  {},
  mapPropsToStyleNames
)(FooterWithButtons);
