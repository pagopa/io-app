import { Button, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ComponentProps } from "../../types/react";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import IconFont from "./IconFont";

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
  flexRow: { flexDirection: "row" }
});

type OwnButtonProps = {
  title: string;
  buttonFontSize?: number;
  iconName?: string;
};

type CommonProps = Readonly<{
  leftButton: FooterButtonProps;
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

interface ThreeButtonsInLine extends CommonProps {
  type: "ThreeButtonsInLine";
  rightButton: FooterButtonProps;
  midButton: FooterButtonProps;
}

type Props =
  | SingleButton
  | TwoButtonsInlineHalf
  | TwoButtonsInlineThird
  | TwoButtonsInlineThirdInverted
  | ThreeButtonsInLine;

export type BlockButtonsProps = Props;

/**
 * Implements a component that show buttons on a line on 1, 2 or 3 buttons
 */
export default class BlockButtons extends React.Component<Props, never> {
  private renderRightButton() {
    if (this.props.type === "SingleButton") {
      return null;
    }

    const {
      type,
      rightButton: {
        title: rightButtonTitle,
        buttonFontSize: fontSize,
        iconName: icon,
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
          {icon && <IconFont name={icon} />}
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

  private renderMidButton() {
    if (this.props.type !== "ThreeButtonsInLine") {
      return null;
    }
    const {
      title: midButtonTitle,
      buttonFontSize: fontSize,
      iconName: icon,
      ...otherPropsMidProps
    } = this.props.midButton;

    return (
      <ButtonDefaultOpacity style={styles.button} {...otherPropsMidProps}>
        {icon && <IconFont name={icon} />}
        <Text style={fontSize !== undefined ? { fontSize } : {}}>
          {midButtonTitle}
        </Text>
      </ButtonDefaultOpacity>
    );
  }

  private renderLeftButton = () => {
    const {
      title: leftButtonTitle,
      buttonFontSize: fontSize,
      iconName: icon,
      ...otherPropsLeftButton
    } = this.props.leftButton;
    return (
      <ButtonDefaultOpacity
        style={
          this.props.type === "TwoButtonsInlineThirdInverted"
            ? styles.buttonTwoThirds
            : styles.button
        }
        {...otherPropsLeftButton}
      >
        {icon && <IconFont name={icon} />}
        <Text style={fontSize !== undefined ? { fontSize } : {}}>
          {leftButtonTitle}
        </Text>
      </ButtonDefaultOpacity>
    );
  };

  public render() {
    return (
      <View style={styles.flexRow}>
        {this.renderLeftButton()}
        {this.renderMidButton()}
        {this.renderRightButton()}
      </View>
    );
  }
}
