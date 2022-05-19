import React, { useEffect } from "react";
import { CompatNavigationProp } from "@react-navigation/compat";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import * as pot from "italia-ts-commons/lib/pot";
import { connect } from "react-redux";
import { PaymentNoticeNumberFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
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
import {
  abortRunningPayment,
  paymentAttiva,
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentVerifica
} from "../../../store/actions/wallet/payment";
import { IOColors } from "../../../components/core/variables/IOColors";
import { PayloadForAction } from "../../../types/utils";
import { navigateToPaymentTransactionErrorScreen } from "../../../store/actions/navigation";
import { isError } from "../../../features/bonus/bpd/model/RemoteValue";
import { PaymentState } from "../../../store/reducers/wallet/payment";
import { TransactionSummary } from "./components/TransactionSummary";
import { TransactionSummaryStatus } from "./components/TransactionSummaryStatus";

export type TransactionSummaryError = Option<
  PayloadForAction<
    | typeof paymentVerifica["failure"]
    | typeof paymentAttiva["failure"]
    | typeof paymentIdPolling["failure"]
  >
>;

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const renderFooter = (isLoading: boolean) => {
  if (isLoading) {
    return (
      <FooterWithButtons
        type="SingleButton"
        leftButton={{
          block: true,
          onPress: undefined,
          title: "",
          disabled: true,
          style: { backgroundColor: IOColors.greyLight, width: "100%" },
          isLoading: true,
          iconColor: IOColors.bluegreyDark
        }}
      />
    );
  }

  return (
    <FooterWithButtons
      type="SingleButton"
      leftButton={{
        block: true,
        onPress: () => {},
        title: I18n.t("global.buttons.continue")
      }}
    />
  );
};

type OwnProps = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<WalletParamsList, "PAYMENT_TRANSACTION_SUMMARY">
  >;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const NewTransactionSummaryScreen = ({
  isLoading,
  error,
  paymentVerification,
  verifyPayment,
  onDuplicatedPayment,
  navigateToPaymentTransactionError,
  shouldNavigateToPaymentTransactionError,
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

  const errorOrUndefined = error.toUndefined();
  useEffect(() => {
    if (errorOrUndefined === undefined) {
      return;
    }
    if (errorOrUndefined === "PAA_PAGAMENTO_DUPLICATO") {
      onDuplicatedPayment();
    }
    if (shouldNavigateToPaymentTransactionError(paymentVerification)) {
      navigateToPaymentTransactionError(fromNullable(errorOrUndefined));
    }
  }, [
    errorOrUndefined,
    onDuplicatedPayment,
    navigateToPaymentTransactionError,
    shouldNavigateToPaymentTransactionError,
    paymentVerification
  ]);

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
        <TransactionSummaryStatus error={error} />
        <ScrollView>
          <TransactionSummary
            paymentVerification={paymentVerification}
            paymentNoticeNumber={paymentNoticeNumber}
            organizationFiscalCode={organizationFiscalCode}
            isPaid={false}
          />
        </ScrollView>
        {renderFooter(isLoading)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const { verifica, attiva, paymentId, check, pspsV2 } = state.wallet.payment;

  const isLoading = pot.isLoading(verifica);

  const error: TransactionSummaryError = pot.isError(verifica)
    ? some(verifica.error)
    : pot.isError(attiva)
    ? some(attiva.error)
    : pot.isError(paymentId)
    ? some(paymentId.error)
    : pot.isError(check) || isError(pspsV2.psps)
    ? some(undefined)
    : none;

  const walletById = state.wallet.wallets.walletById;

  return {
    paymentVerification: verifica,
    isLoading,
    error,
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

  const onDuplicatedPayment = () =>
    dispatch(
      paymentCompletedSuccess({
        rptId,
        kind: "DUPLICATED"
      })
    );

  const onCancel = () => {
    dispatch(abortRunningPayment());
  };

  const navigateToPaymentTransactionError = (error: TransactionSummaryError) =>
    navigateToPaymentTransactionErrorScreen({
      error,
      onCancel,
      rptId
    });

  // We show inline error status only if the payment starts
  // from a message and the verification fails. In all the other
  // cases we present the fullscreen error message.
  const shouldNavigateToPaymentTransactionError = (
    paymentVerification: PaymentState["verifica"]
  ) => !(paymentStartOrigin === "message" && pot.isError(paymentVerification));

  return {
    loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff()),
    verifyPayment,
    onDuplicatedPayment,
    navigateToPaymentTransactionError,
    shouldNavigateToPaymentTransactionError
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewTransactionSummaryScreen);
