import { Button, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import { ComponentProps } from "../../types/react";
import ButtonWithoutOpacity from "../ButtonWithoutOpacity";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  button: {
    alignContent: "center",
    justifyContent: "center",
    flex: 1
  },
  buttonTwoThirds: {
    alignContent: "center",
    flex: 2
  }
});

type OwnButtonProps = {
  title: string;
  buttonFontSize?: number;
};

type FooterButtonProps = ComponentProps<Button> & OwnButtonProps;

export interface SingleButton {
  type: "SingleButton";
  leftButton: FooterButtonProps;
}

export interface TwoButtonsInlineHalf {
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
      rightButton: {
        title: rightButtonTitle,
        buttonFontSize: fontSize,
        ...otherPropsRightButton
      }
    } = this.props;

    return (
      <React.Fragment>
        <View hspacer={true} />
        <ButtonWithoutOpacity
          {...otherPropsRightButton}
          style={
            type === "TwoButtonsInlineThird"
              ? styles.buttonTwoThirds
              : styles.button
          }
        >
          <Text numberOfLines={1} style={{ fontSize }}>
            {rightButtonTitle}
          </Text>
        </ButtonWithoutOpacity>
      </React.Fragment>
    );
  }

  public render() {
    const {
      title: leftButtonTitle,
      buttonFontSize: fontSize,
      ...otherPropsLeftButton
    } = this.props.leftButton;

    return (
      <View footer={true} style={styles.container}>
        <ButtonWithoutOpacity style={styles.button} {...otherPropsLeftButton}>
          <Text style={{ fontSize }}>{leftButtonTitle}</Text>
        </ButtonWithoutOpacity>
        {this.renderRightButton()}
      </View>
    );
  }
}
