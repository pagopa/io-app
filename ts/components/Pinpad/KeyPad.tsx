import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Col, Grid, Row, Text } from "native-base";
import * as React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../../theme/fonts";
import variables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";

type Digit = ITuple2<string, () => void> | undefined;

type Props = Readonly<{
  digits: ReadonlyArray<ReadonlyArray<Digit>>;
  buttonType: "primary" | "light";
  isDisabled: boolean;
}>;

// it generate buttons width of 56
const radius = 18;

const styles = StyleSheet.create({
  roundButton: {
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 16,
    alignSelf: "center",
    justifyContent: "center",
    width: (radius + 10) * 2,
    height: (radius + 10) * 2,
    borderRadius: radius + 10
  },

  buttonTextBase: {
    ...makeFontStyleObject(Platform.select, "300"),
    fontSize: 30,
    lineHeight: 32,
    marginBottom: -10
  },
  image: {
    width: 40,
    height: 48
  },
  white: {
    color: variables.colorWhite
  },
  buttonTextDigit: {
    fontSize: radius + 10
  },

  buttonTextLabel: {
    fontSize: radius - 5
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
        ? {
            backgroundColor: "transparent"
          }
        : {};
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
        {!label.endsWith(".png") ? (
          <Text
            white={style === "label" && buttonType === "primary"}
            style={[
              styles.buttonTextBase,
              style === "label" && styles.buttonTextLabel
            ]}
          >
            {label}
          </Text>
        ) : label === "faceid-onboarding-icon.png" ? (
          <Image
            source={require("../../../img/icons/faceid-onboarding-icon.png")}
            style={styles.image}
          />
        ) : (
          <Image
            source={require("../../../img/icons/fingerprint-onboarding-icon.png")}
            style={styles.image}
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
