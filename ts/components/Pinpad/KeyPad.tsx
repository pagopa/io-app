import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Button, Col, Grid, Row, Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import variables from "../../theme/variables";

type Digit = ITuple2<string, () => void> | undefined;

type Props = Readonly<{
  digits: ReadonlyArray<ReadonlyArray<Digit>>;
  buttonType: "primary" | "light";
  isDisabled: boolean;
}>;

// TODO: make it variable based on screen width
const radius = 20;

const styles = StyleSheet.create({
  roundButton: {
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 16,
    alignSelf: "center",
    justifyContent: "center",
    width: (radius + 10) * 2,
    height: (radius + 10) * 2,
    borderRadius: radius + 10,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0,
    elevation: 0
  },

  buttonTextBase: {
    margin: 0,
    paddingTop: Math.round(radius / 2) + 4,
    lineHeight: radius + 10,
    fontWeight: "200"
  },

  buttonTextDigit: {
    fontSize: radius + 10
  },

  buttonTextLabel: {
    fontSize: radius
  },

  white: {
    color: variables.colorWhite
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
  return (
    <Col key={key}>
      <Button
        onPress={handler}
        disabled={isDisabled}
        style={style === "digit" ? styles.roundButton : {}}
        transparent={style === "label"}
        block={style === "label"}
        primary={buttonType === "primary"}
        light={buttonType === "light"}
      >
        <Text
          style={[
            styles.buttonTextBase,
            style === "digit" ? styles.buttonTextDigit : styles.buttonTextLabel,
            style === "label" && buttonType === "primary" ? styles.white : {}
          ]}
        >
          {label}
        </Text>
      </Button>
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
