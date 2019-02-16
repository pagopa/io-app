import { ITuple2 } from "io-ts-commons/lib/tuples";
import { Button, Col, Grid, Row, Text } from "native-base";
import * as React from "react";

import { styles } from "./Pinpad.style";

type Digit = ITuple2<string, () => void> | undefined;

type Props = Readonly<{
  digits: ReadonlyArray<ReadonlyArray<Digit>>;
  buttonType: "primary" | "light";
}>;

const renderPinCol = (
  label: string,
  handler: () => void,
  style: "digit" | "label",
  key: string,
  buttonType: "primary" | "light"
) => {
  return (
    <Col key={key}>
      <Button
        onPress={handler}
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
            style === "label" && buttonType === "primary"
              ? {
                  color: "white"
                }
              : {}
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
  buttonType: "primary" | "light"
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
            buttonType
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
          renderPinRow(r, `pinpad-row-${i}`, this.props.buttonType)
        )}
      </Grid>
    );
  }
}
