import React, { FC } from "react";
import { Alert, StyleSheet } from "react-native";
import { Text, View } from "native-base";
import { connect } from "react-redux";
import { none } from "fp-ts/lib/Option";
import AdviceComponent from "../../../components/AdviceComponent";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import { walletAddBancomatStart } from "../onboarding/bancomat/store/actions";
import { Dispatch } from "../../../store/actions/types";
import { navigateToWalletAddCreditCard } from "../../../store/actions/navigation";
import I18n from "../../../i18n";

const styles = StyleSheet.create({
  icon: {
    color: customVariables.brandPrimaryInverted,
    height: 24
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0
  },
  textButton: {
    paddingLeft: 0,
    paddingRight: 0
  }
});

type OwnProps = { forBancomat?: boolean };

const mapDispatchToProps = (dispatch: Dispatch, { forBancomat }: OwnProps) => ({
  navigateToAddCard: forBancomat
    ? () => {
        Alert.alert(
          I18n.t("wallet.onboarding.bancomat.pleaseWaitDialog.title"),
          I18n.t("wallet.onboarding.bancomat.pleaseWaitDialog.body"),
          [
            {
              text: I18n.t(
                "wallet.onboarding.bancomat.pleaseWaitDialog.confirm"
              ),
              onPress: () => dispatch(walletAddBancomatStart())
            }
          ]
        );
      }
    : () =>
        dispatch(
          navigateToWalletAddCreditCard({
            inPayment: none
          })
        )
});

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

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
      <Text style={styles.textButton}>{I18n.t("onboarding.addNewCard")}</Text>
    </ButtonDefaultOpacity>
  </>
);

export default connect(null, mapDispatchToProps)(ExpiredCardAdvice);
