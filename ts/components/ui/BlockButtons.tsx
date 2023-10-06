import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Button, Text as NBButtonText } from "native-base";
import * as React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { IOColors, IOIcons, Icon, HSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../i18n";
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
  flexRow: { flexDirection: "row" }
});

type OwnButtonProps = {
  onPressWithGestureHandler?: true;
  title: string;
  buttonFontSize?: number;
  iconName?: IOIcons;
  iconColor?: IOColors;
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
  | TwoButtonsInlineHalf
  | TwoButtonsInlineThird
  | TwoButtonsInlineThirdInverted
  | ThreeButtonsInLine;

export type BlockButtonsProps = Props;

/**
 * Implements a component that show buttons on a line on 1, 2 or 3 buttons
 *
 * @deprecated Use the new temporary `BlockButtons` from the `io-app-design-system` to
 * refactor the legacy screens and remove `NativeBase` buttons.
 */
export default class BlockButtons extends React.Component<Props, never> {
  private renderRightButton = () => {
    if (this.props.type === "SingleButton") {
      return null;
    }

    const rightButtonStyle =
      this.props.type === "TwoButtonsInlineThird"
        ? styles.buttonTwoThirds
        : styles.button;

    return (
      <React.Fragment>
        <HSpacer size={16} />
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
        <HSpacer size={16} />
        {this.renderButton(this.props.midButton, styles.button)}
      </React.Fragment>
    );
  };

  private renderLeftButton = () => {
    const leftButtonStyle =
      this.props.type === "TwoButtonsInlineThirdInverted"
        ? styles.buttonTwoThirds
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
        <>
          <Icon
            size={20}
            name={props.iconName}
            color={pipe(
              props.iconColor,
              O.fromNullable,
              O.fold(
                () => undefined,
                c => c
              )
            )}
          />
          <HSpacer size={8} />
        </>
      )}
      <NBButtonText
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
      </NBButtonText>
    </ButtonDefaultOpacity>
  );

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
