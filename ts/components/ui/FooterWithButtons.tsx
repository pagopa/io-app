import { Button, NativeBase, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

type OwnProps = {
  title: string;
};

type Props = Readonly<{
  leftButton: NativeBase.Button & OwnProps;
  rightButton: NativeBase.Button & OwnProps;
  inlineHalf: true;
  inlineOneThird: true;
}>;

/**
 * Implements a component that show 2 buttons in footer with select style (inlineHalf | inlineOneThird)
 */
const FooterWithButtons: React.SFC<Props> = props => {
  const { title: leftButtonTitle, ...otherPropsLeftButton } = props.leftButton;
  const {
    title: rightButtonTitle,
    ...otherPropsRightButton
  } = props.rightButton;

  return (
    <View footer={true}>
      <Button {...otherPropsLeftButton}>
        <Text>{leftButtonTitle}</Text>
      </Button>
      {props.inlineHalf || props.inlineOneThird ? (
        <View hspacer={true} />
      ) : (
        <View spacer={true} />
      )}
      <Button {...otherPropsRightButton}>
        <Text>{rightButtonTitle}</Text>
      </Button>
    </View>
  );
};

export default connectStyle(
  "UIComponent.FooterWithButtons",
  {},
  mapPropsToStyleNames
)(FooterWithButtons);
