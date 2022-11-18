import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Button, Text as NBText, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import I18n from "../../i18n";
import { ComponentProps } from "../../types/react";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { IOStyles } from "../core/variables/IOStyles";
import IconFont from "./IconFont";

const styles = StyleSheet.create({
  button: {
    alignContent: "center",
    justifyContent: "center",
    flex: 1
  },
  verticalButton: {
    alignContent: "center",
    justifyContent: "center"
  },
  buttonTwoThirds: {
    alignContent: "center",
    flex: 2
  }
});

type OwnButtonProps = {
  onPressWithGestureHandler?: true;
  title: string;
  buttonFontSize?: number;
  iconName?: string;
  iconColor?: string;
  labelColor?: string;
  isLoading?: boolean;
};

type CommonProps = Readonly<{
  leftButton: BlockButtonProps;
  accessible?: boolean;
}>;

export type BlockButtonProps = ComponentProps<Button> & OwnButtonProps;

/**
 * | single button |
 */
export interface SingleButton extends CommonProps {
  type: "SingleButton";
}

/**
 * |  left  |
 * |  right |
 */
export interface TwoButtonsVertical extends CommonProps {
  type: "TwoButtonsVertical";
  leftButton: BlockButtonProps;
  rightButton: BlockButtonProps;
}

/**
 * | left | right |
 */
export interface TwoButtonsInlineHalf extends CommonProps {
  type: "TwoButtonsInlineHalf";
  rightButton: BlockButtonProps;
}

/**
 * | left  |       right        |
 */
interface TwoButtonsInlineThird extends CommonProps {
  type: "TwoButtonsInlineThird";
  rightButton: BlockButtonProps;
}

/**
 * |      left       |  right  |
 */
interface TwoButtonsInlineThirdInverted extends CommonProps {
  type: "TwoButtonsInlineThirdInverted";
  rightButton: BlockButtonProps;
}

/**
 * |  left |  mid  | right |
 */
interface ThreeButtonsInLine extends CommonProps {
  type: "ThreeButtonsInLine";
  rightButton: BlockButtonProps;
  midButton: BlockButtonProps;
}

type Props =
  | SingleButton
  | TwoButtonsVertical
  | TwoButtonsInlineHalf
  | TwoButtonsInlineThird
  | TwoButtonsInlineThirdInverted
  | ThreeButtonsInLine;

export type BlockButtonsProps = Props;

/**
 * Implements a component that show buttons on a line on 1, 2 or 3 buttons
 */
export default class BlockButtons extends React.Component<Props, never> {
  private renderRightButton = () => {
    if (this.props.type === "SingleButton") {
      return null;
    }

    const rightButtonStyle =
      this.props.type === "TwoButtonsInlineThird"
        ? styles.buttonTwoThirds
        : this.props.type === "TwoButtonsVertical"
        ? styles.verticalButton
        : styles.button;

    const spacer = this.props.type === "TwoButtonsVertical";
    const hspacer = this.props.type !== "TwoButtonsVertical";

    return (
      <React.Fragment>
        <View spacer={spacer} hspacer={hspacer} />
        {this.renderButton(this.props.rightButton, rightButtonStyle)}
      </React.Fragment>
    );
  };

  private renderMidButton = () => {
    if (this.props.type !== "ThreeButtonsInLine") {
      return null;
    }

    return (
      <React.Fragment>
        <View hspacer={true} />
        {this.renderButton(this.props.midButton, styles.button)}
      </React.Fragment>
    );
  };

  private renderLeftButton = () => {
    const leftButtonStyle =
      this.props.type === "TwoButtonsInlineThirdInverted"
        ? styles.buttonTwoThirds
        : this.props.type === "TwoButtonsVertical"
        ? styles.verticalButton
        : styles.button;

    return this.renderButton(this.props.leftButton, leftButtonStyle);
  };

  private renderButton = (
    props: BlockButtonProps,
    style: ComponentProps<typeof ButtonDefaultOpacity>["style"]
  ) => (
    <ButtonDefaultOpacity style={style} {...props}>
      {props.isLoading && (
        <ActivityIndicator
          animating={true}
          size={"small"}
          color={props.iconColor}
          accessible={true}
          accessibilityHint={I18n.t(
            "global.accessibility.activityIndicator.hint"
          )}
          accessibilityLabel={I18n.t(
            "global.accessibility.activityIndicator.label"
          )}
          importantForAccessibility={"no-hide-descendants"}
        />
      )}
      {props.iconName && (
        <IconFont
          name={props.iconName}
          style={pipe(
            props.iconColor,
            O.fromNullable,
            O.fold(
              () => undefined,
              c => ({
                color: c
              })
            )
          )}
        />
      )}
      <NBText
        style={[
          pipe(
            props.buttonFontSize,
            O.fromNullable,
            O.fold(
              () => undefined,
              fs => ({
                fontSize: fs
              })
            )
          ),
          pipe(
            props.labelColor,
            O.fromNullable,
            O.fold(
              () => undefined,
              lc => ({
                color: lc
              })
            )
          )
        ]}
      >
        {props.title}
      </NBText>
    </ButtonDefaultOpacity>
  );

  public render() {
    return (
      <View
        style={
          this.props.type === "TwoButtonsVertical"
            ? IOStyles.column
            : IOStyles.row
        }
      >
        {this.renderLeftButton()}
        {this.renderMidButton()}
        {this.renderRightButton()}
      </View>
    );
  }
}
