import React from "react";
import { CompatNavigationProp } from "@react-navigation/compat";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import * as pot from "italia-ts-commons/lib/pot";
import { connect } from "react-redux";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { GlobalState } from "../../../store/reducers/types";
import { Dispatch } from "../../../store/actions/types";
import { fetchWalletsRequestWithExpBackoff } from "../../../store/actions/wallet/wallets";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { paymentVerifica } from "../../../store/actions/wallet/payment";
import { TransactionSummary } from "./components/TransactionSummary";

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

type OwnProps = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<WalletParamsList, "PAYMENT_TRANSACTION_SUMMARY">
  >;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const NewTransactionSummaryScreen = ({
  paymentVerification,
  verifyPayment,
  walletById,
  loadWallets,
  navigation
}: Props): React.ReactElement => {
  useOnFirstRender(() => {
    if (pot.isNone(paymentVerification)) {
      verifyPayment();
    }
    if (!pot.isSome(walletById)) {
      loadWallets();
    }
  });

  const rptId = navigation.getParam("rptId");

  const paymentNoticeNumber = PaymentNoticeNumberFromString.encode(
    rptId.paymentNoticeNumber
  );

  /**
   * try to show the fiscal code coming from the 'verification' API
   * otherwise (it could be an issue with the API) use the rptID coming from
   * static data (e.g. message, qrcode, manual insertion, etc.)
   */
  const organizationFiscalCode = pot
    .toOption(paymentVerification)
    .mapNullable(_ => _.enteBeneficiario?.identificativoUnivocoBeneficiario)
    .getOrElse(rptId.organizationFiscalCode);

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.ConfirmPayment.paymentInformations")}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <TransactionSummary
            paymentVerification={paymentVerification}
            paymentNoticeNumber={paymentNoticeNumber}
            organizationFiscalCode={organizationFiscalCode}
            isPaid={false}
          />
        </ScrollView>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            block: true,
            onPress: () => {},
            title: I18n.t("global.buttons.continue")
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const { verifica } = state.wallet.payment;
  const walletById = state.wallet.wallets.walletById;
  return {
    paymentVerification: verifica,
    walletById
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const rptId = props.navigation.getParam("rptId");
  const paymentStartOrigin = props.navigation.getParam("paymentStartOrigin");

  const verifyPayment = () =>
    dispatch(
      paymentVerifica.request({ rptId, startOrigin: paymentStartOrigin })
    );

  return {
    loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff()),
    verifyPayment
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewTransactionSummaryScreen);
