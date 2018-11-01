import { Button, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { StyleSheet } from "react-native";

import { ComponentProps } from "../../types/react";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  button: {
    alignContent: "center",
    flex: 1
  },
  buttonTwoThirds: {
    alignContent: "center",
    flex: 2
  }
});

type OwnButtonProps = {
  title: string;
};

type FooterButtonProps = ComponentProps<Button> & OwnButtonProps;

interface SingleButton {
  type: "SingleButton";
  leftButton: FooterButtonProps;
}

interface TwoButtonsInlineHalf {
  type: "TwoButtonsInlineHalf";
  leftButton: FooterButtonProps;
  rightButton: FooterButtonProps;
}

interface TwoButtonsInlineThird {
  type: "TwoButtonsInlineThird";
  leftButton: FooterButtonProps;
  rightButton: FooterButtonProps;
}

type Props = SingleButton | TwoButtonsInlineHalf | TwoButtonsInlineThird;

/**
 * Implements a component that show 2 buttons in footer with select style (inlineHalf | inlineOneThird)
 */
export default class FooterWithButtons extends React.Component<Props, never> {
  private renderRightButton() {
    if (this.props.type === "SingleButton") {
      return null;
    }

    const {
      type,
      rightButton: { title: rightButtonTitle, ...otherPropsRightButton }
    } = this.props;

    return (
      <React.Fragment>
        <View hspacer={true} />
        <Button
          {...otherPropsRightButton}
          style={
            type === "TwoButtonsInlineThird"
              ? styles.buttonTwoThirds
              : styles.button
          }
        >
          <Text>{rightButtonTitle}</Text>
        </Button>
      </React.Fragment>
    );
  }

  public render() {
    const {
      title: leftButtonTitle,
      ...otherPropsLeftButton
    } = this.props.leftButton;

    return (
      <View footer={true} style={styles.container}>
        <Button {...otherPropsLeftButton} style={styles.button}>
          <Text>{leftButtonTitle}</Text>
        </Button>
        {this.renderRightButton()}
      </View>
    );
  }
}
