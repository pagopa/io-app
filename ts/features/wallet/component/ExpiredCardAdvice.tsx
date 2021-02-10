import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { View } from "native-base";
import AdviceComponent from "../../../components/AdviceComponent";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import I18n from "../../../i18n";
import { Label } from "../../../components/core/typography/Label";
import { IOColors } from "../../../components/core/variables/IOColors";

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

const ExpiredCardAdvice: FC<Props> = ({ navigateToAddCard }) => (
  <>
    <AdviceComponent iconSize={30} text={I18n.t("wallet.expiredCard")} />
    <View spacer />
    <ButtonDefaultOpacity
      small={true}
      primary={true}
      style={styles.button}
      block={true}
      onPress={navigateToAddCard}
    >
      <IconFont name="io-plus" style={styles.icon} />
      <Label color="white">{I18n.t("onboarding.addNewCard")}</Label>
    </ButtonDefaultOpacity>
  </>
);

export default ExpiredCardAdvice;
