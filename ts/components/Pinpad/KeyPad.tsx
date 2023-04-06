import { ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Col, Grid, Row, Text as NBButtonText } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { hexToRgba, IOColors } from "../core/variables/IOColors";
import StyledIconFont from "../ui/IconFont";

// left -> the string to represent as text
// right -> the icon to represent with name and size
export type DigitRpr = E.Either<
  string,
  { name: string; size: number; accessibilityLabel: string }
>;
type Digit = ITuple2<DigitRpr, () => void> | undefined;

type Props = Readonly<{
  digits: ReadonlyArray<ReadonlyArray<Digit>>;
  buttonType: "primary" | "light";
  isDisabled: boolean;
}>;

// it generate buttons width of 56
const radius = 18;
const BUTTON_DIAMETER = 56;
const opaqueButtonBackground = hexToRgba(IOColors.black, 0.1);

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
    borderRadius: BUTTON_DIAMETER / 2,
    backgroundColor: opaqueButtonBackground
  },
  transparent: {
    backgroundColor: `transparent`
  },
  buttonTextBase: {
    ...makeFontStyleObject(Platform.select, "300"),
    fontSize: 30,
    lineHeight: 32,
    marginBottom: -10
  },
  buttonTextLabel: {
    fontSize: radius - 5
  },
  noPadded: {
    paddingRight: 0
  }
});

const renderPinCol = (
  label: DigitRpr,
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

  const accessibilityLabel = pipe(
    label,
    E.fold(
      () => undefined,
      ic => ic.accessibilityLabel
    )
  );

  return (
    <Col key={key}>
      <ButtonDefaultOpacity
        onPress={handler}
        disabled={isDisabled}
        style={buttonStyle}
        block={style === "label"}
        primary={buttonType === "primary"}
        unNamed={buttonType === "light"}
        accessibilityLabel={accessibilityLabel}
      >
        {pipe(
          label,
          E.fold(
            l => (
              <NBButtonText
                white={style === "label" && buttonType === "primary"}
                style={[
                  styles.buttonTextBase,
                  style === "label" && styles.buttonTextLabel
                ]}
              >
                {l}
              </NBButtonText>
            ),
            ic => (
              <StyledIconFont
                name={ic.name}
                size={ic.size}
                style={styles.noPadded}
                color={
                  buttonType === "light"
                    ? customVariables.contentPrimaryBackground
                    : IOColors.white
                }
              />
            )
          )
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
    {digits.map((el, i) =>
      el ? (
        renderPinCol(
          el.e1,
          el.e2,
          E.isLeft(el.e1) ? "digit" : "label",
          `pinpad-digit-${i}`,
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
