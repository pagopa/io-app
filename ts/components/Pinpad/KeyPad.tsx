import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Col, Grid, Row, Text } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../../theme/fonts";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import StyledIconFont from "../ui/IconFont";

type Digit = ITuple2<string, () => void> | undefined;

type Props = Readonly<{
  digits: ReadonlyArray<ReadonlyArray<Digit>>;
  buttonType: "primary" | "light";
  isDisabled: boolean;
}>;

// it generate buttons width of 56
const radius = 18;
const BUTTON_DIAMETER = 56;

const SMALL_ICON_WIDTH = 17;
const ICON_WIDTH = 48;

const styles = StyleSheet.create({
  roundButton: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    paddingLeft: 0,
    marginBottom: 16,
    alignSelf: "center",
    justifyContent: "center",
    width: BUTTON_DIAMETER,
    height: BUTTON_DIAMETER,
    borderRadius: BUTTON_DIAMETER / 2
  },
  transparent: {
    backgroundColor: "transparent"
  },
  buttonTextBase: {
    ...makeFontStyleObject(Platform.select, "300"),
    fontSize: 30,
    lineHeight: 32,
    marginBottom: -10
  },
  white: {
    color: variables.colorWhite
  },
  buttonTextDigit: {
    fontSize: radius + 10
  },
  buttonTextLabel: {
    fontSize: radius - 5
  },
  noPadded: {
    paddingRight: 0
  }
});

const renderPinCol = (
  label: string,
  handler: () => void,
  style: "digit" | "label",
  key: string,
  buttonType: "primary" | "light",
  isDisabled: boolean
) => {
  const buttonStyle =
    style === "digit"
      ? styles.roundButton
      : style === "label"
        ? [styles.roundButton, styles.transparent]
        : undefined;

  const iconName =
    label.includes("icon:") || label.startsWith("reducedIcon:")
      ? label.split(":")[1]
      : undefined;

  return (
    <Col key={key}>
      <ButtonDefaultOpacity
        onPress={handler}
        disabled={isDisabled}
        style={buttonStyle}
        block={style === "label"}
        primary={buttonType === "primary"}
        unNamed={buttonType === "light"}
      >
        {!iconName ? (
          <Text
            white={style === "label" && buttonType === "primary"}
            style={[
              styles.buttonTextBase,
              style === "label" && styles.buttonTextLabel
            ]}
          >
            {label}
          </Text>
        ) : (
          <StyledIconFont
            name={label.split(":")[1]}
            size={label.includes("sicon") ? SMALL_ICON_WIDTH : ICON_WIDTH}
            style={[styles.noPadded]}
            color={
              buttonType === "light"
                ? customVariables.contentPrimaryBackground
                : customVariables.colorWhite
            }
          />
        )}
      </ButtonDefaultOpacity>
    </Col>
  );
};

const renderPinRow = (
  digits: ReadonlyArray<Digit>,
  key: string,
  buttonType: "primary" | "light",
  isDisabled: boolean
) => (
  <Row key={key}>
    {digits.map(
      (el, i) =>
        el ? (
          renderPinCol(
            el.e1,
            el.e2,
            el.e1.length === 1 ? "digit" : "label",
            `pinpad-digit-${el.e2}`,
            buttonType,
            isDisabled
          )
        ) : (
          <Col key={`pinpad-empty-${i}`} />
        )
    )}
  </Row>
);

/**
 * Renders a virtual key pad.
 *
 * This component is used for typing PINs
 */
export class KeyPad extends React.PureComponent<Props> {
  public render() {
    return (
      <Grid>
        {this.props.digits.map((r, i) =>
          renderPinRow(
            r,
            `pinpad-row-${i}`,
            this.props.buttonType,
            this.props.isDisabled
          )
        )}
      </Grid>
    );
  }
}
