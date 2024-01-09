import * as React from "react";
import { View, Dimensions, Image, StyleSheet } from "react-native";
import { sequence } from "fp-ts/lib/Array";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Body, H6, IOColors, Label } from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";
import {
  CredentialCatalogDisplay,
  getImageFromCredentialType
} from "../utils/itwMocksUtils";
import { ParsedCredential } from "../utils/itwTypesUtils";

/**
 * Common props for the component.
 * @param display - the display configuration for the credential.
 * @param type - the type of the credential.
 */
type CommonProps = {
  display: CredentialCatalogDisplay;
  type: string;
};

/**
 * Props for the component when the credential is a generic credential.
 * @param parsedCredential - the parsed credential.
 */
type WithCredentialProps = CommonProps & {
  parsedCredential: ParsedCredential;
};

type CredentialCardProps = WithCredentialProps;

/**
 * Background standard dimension.
 */
const BACKGROUND_WIDTH = 820;
const BACKGROUND_HEIGTH = 518;

const CARD_WIDTH =
  Dimensions.get("screen").width - 2 * customVariables.contentPadding;

const SCALE_FACTOR = CARD_WIDTH / BACKGROUND_WIDTH;

const TEXT_LEFT_MARGIN = 50 * SCALE_FACTOR;

const CARD_HEIGHT = BACKGROUND_HEIGTH * SCALE_FACTOR;

const NAME_MARGIN_TOP = 380 * SCALE_FACTOR;

const FISCAL_CODE_MARGIN_TOP = NAME_MARGIN_TOP + 55 * SCALE_FACTOR;

const TITLE_MARGIN_TOP = 50 * SCALE_FACTOR;

/**
 * Encapsulate the logic for displaying the lines in the bottom left corner of the card.
 */
const OverlayLines = ({
  parsedCredential,
  display: { textColor, firstLine, secondLine }
}: CredentialCardProps) => {
  const maybeComposedLine = (line?: Array<string>) =>
    pipe(
      line,
      O.fromNullable,
      O.map(item => item.map(item => O.fromNullable(parsedCredential[item]))),
      O.chain(sequence(O.option)),
      O.map(item => item.map(item => item.value).join(" "))
    );

  return pipe(
    // either we can have both lines or none
    sequenceS(O.option)({
      firstLine: maybeComposedLine(firstLine),
      secondLine: maybeComposedLine(secondLine)
    }),
    E.fromOption(() => undefined),
    // in case we have both lines, we can render them
    E.map(({ firstLine, secondLine }) => (
      <>
        <Label
          weight="Regular"
          color={textColor}
          style={[styles.text, styles.nameText]}
          accessibilityLabel={firstLine}
        >
          {firstLine}
        </Label>

        <Body
          weight="SemiBold"
          color={textColor}
          style={[styles.text, styles.fiscalCodeText]}
          accessibilityLabel={secondLine}
        >
          {secondLine}
        </Body>
      </>
    )),
    E.mapLeft(() => <></> /* nothing to render */),
    E.toUnion
  );
};

/**
 * Renders a card for the PID credential with the name and fiscal code of the owner.
 * @param title - the credential title.
 * @param name - the name of the owner.
 * @param fiscalCode - the fiscal code of the owner.
 * @param backgroundImage - the background image of the card.
 */
const ItwCredentialCard = (props: CredentialCardProps) => {
  /**
   * This function returns the lines to display in the bottom left corner of the card.
   * Based on the type of the credential, it returns the name and fiscal code of the owner if the credential is a PID,
   * the values of the fields specified in the display configuration of the credential otherwise.
   * @returns an object containing the lines to display.
   */
  /*   const getLines = (): { firstLine: string; secondLine: string } => {
    if ("pidClaims" in props) {
      const { pidClaims } = props;
      return {
        firstLine: `${pidClaims.givenName} ${pidClaims.familyName}`,
        secondLine: pidClaims.taxIdCode
      };
    } else {
      const { firstLine, secondLine } = props.display;
      const flText =
        firstLine && firstLine.length > 0
          ? firstLine.map(item => props.parsedCredential[item].value).join(" ")
          : "";
      const slText =
        secondLine && secondLine.length > 0
          ? secondLine.map(item => props.parsedCredential[item].value).join(" ")
          : "";
      return { firstLine: flText, secondLine: slText };
    }
  }; */

  const { textColor, title } = props.display;

  const image = getImageFromCredentialType(props.type);

  return (
    <View>
      <Image source={image} style={styles.cardBackground} />
      <H6
        color={textColor}
        accessibilityLabel={title}
        style={[styles.text, styles.titleText]}
      >
        {props.display.title}
      </H6>
      <OverlayLines {...props} />
    </View>
  );
};

export default ItwCredentialCard;

const styles = StyleSheet.create({
  cardBackground: {
    resizeMode: "contain",
    height: CARD_HEIGHT,
    width: CARD_WIDTH
  },
  text: {
    position: "absolute",
    marginLeft: TEXT_LEFT_MARGIN,
    color: IOColors.white,
    fontWeight: "700"
  },
  fiscalCodeText: {
    marginTop: FISCAL_CODE_MARGIN_TOP,
    color: IOColors.white
  },
  nameText: {
    marginTop: NAME_MARGIN_TOP,
    color: IOColors.white
  },
  titleText: {
    marginTop: TITLE_MARGIN_TOP,
    colors: IOColors.white
  }
});
