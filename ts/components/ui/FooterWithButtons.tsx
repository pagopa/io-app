import { Button, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ComponentProps } from "../../types/react";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";

const styles = StyleSheet.create({
  button: {
    alignContent: "center",
    justifyContent: "center",
    flex: 1
  },
  buttonTwoThirds: {
    alignContent: "center",
    flex: 2
  },
  flexRow: { flexDirection: "row" },
  padded: { paddingBottom: 14 }
});

type OwnButtonProps = {
  title: string;
  buttonFontSize?: number;
};

type CommonProps = Readonly<{
  leftButton: FooterButtonProps;
  upperButton?: FooterButtonProps;
}>;

type FooterButtonProps = ComponentProps<Button> & OwnButtonProps;

export interface SingleButton extends CommonProps {
  type: "SingleButton";
}

export interface TwoButtonsInlineHalf extends CommonProps {
  type: "TwoButtonsInlineHalf";
  rightButton: FooterButtonProps;
}

interface TwoButtonsInlineThird extends CommonProps {
  type: "TwoButtonsInlineThird";
  rightButton: FooterButtonProps;
}

interface TwoButtonsInlineThirdInverted extends CommonProps {
  type: "TwoButtonsInlineThirdInverted";
  rightButton: FooterButtonProps;
}

type Props =
  | SingleButton
  | TwoButtonsInlineHalf
  | TwoButtonsInlineThird
  | TwoButtonsInlineThirdInverted;

/**
 * Implements a component that show buttons as sticky footer. It can displays 1 or 2 lines of buttons.
 * the upper line can include one blocked button
 * The bottom line can be include 1 or 2 buttons. If they are 2, they can have the inlineHalf  or the inlineOneThird style
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
        <ButtonDefaultOpacity
          {...otherPropsRightButton}
          style={
            type === "TwoButtonsInlineThird"
              ? styles.buttonTwoThirds
              : styles.button
          }
        >
          <Text
            numberOfLines={1}
            style={fontSize !== undefined ? { fontSize } : {}}
          >
            {rightButtonTitle}
          </Text>
        </ButtonDefaultOpacity>
      </React.Fragment>
    );
  }

  private renderBottomButtonsLine = () => {
    const {
      title: leftButtonTitle,
      buttonFontSize: fontSize,
      ...otherPropsLeftButton
    } = this.props.leftButton;
    return (
      <View style={styles.flexRow}>
        <ButtonDefaultOpacity
          style={
            this.props.type === "TwoButtonsInlineThirdInverted"
              ? styles.buttonTwoThirds
              : styles.button
          }
          {...otherPropsLeftButton}
        >
          <Text style={fontSize !== undefined ? { fontSize } : {}}>
            {leftButtonTitle}
          </Text>
        </ButtonDefaultOpacity>
        {this.renderRightButton()}
      </View>
    );
  };

  private renderUpperButton = () => {
    if (this.props.upperButton === undefined) {
      return;
    }

    const {
      title: upperButtonTitle,
      buttonFontSize: fontSize,
      ...otherPropsUpperButton
    } = this.props.upperButton;

    return (
      <View style={[styles.flexRow, styles.padded]}>
        <ButtonDefaultOpacity
          style={
            this.props.type === "TwoButtonsInlineThirdInverted"
              ? styles.buttonTwoThirds
              : styles.button
          }
          {...otherPropsUpperButton}
        >
          <Text style={fontSize !== undefined ? { fontSize } : undefined}>
            {upperButtonTitle}
          </Text>
        </ButtonDefaultOpacity>
      </View>
    );
  };

  public render() {
    return (
      <View footer={true}>
        {this.props.upperButton && this.renderUpperButton()}
        {this.renderBottomButtonsLine()}
      </View>
    );
  }
}
