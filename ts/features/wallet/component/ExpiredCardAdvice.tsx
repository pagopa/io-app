import React from "react";
import { StyleSheet } from "react-native";
import { View } from "native-base";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import customVariables from "../../../theme/variables";
import I18n from "../../../i18n";
import { Label } from "../../../components/core/typography/Label";
import { IOColors } from "../../../components/core/variables/IOColors";
import { Body } from "../../../components/core/typography/Body";
import { InfoBox } from "../../../components/box/InfoBox";

const styles = StyleSheet.create({
  icon: {
    color: customVariables.brandPrimaryInverted
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0
  },
  textButton: {
    color: IOColors.white
  }
});

type Props = { navigateToAddCard: () => void };

/**
 * A component to show an info box informing the card is expired and a CTA to add another card
 * @param navigateToAddCard
 * @constructor
 */
const ExpiredCardAdvice = ({ navigateToAddCard }: Props) => (
  <>
    <InfoBox iconSize={32}>
      <Body>{I18n.t("wallet.expiredCard")}</Body>
    </InfoBox>
    <View spacer />
    <ButtonDefaultOpacity
      small={true}
      primary={true}
      style={styles.button}
      block={true}
      onPress={navigateToAddCard}
    >
      <Label color="white">{I18n.t("onboarding.addNewCard")}</Label>
    </ButtonDefaultOpacity>
  </>
);

export default ExpiredCardAdvice;
