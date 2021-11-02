import { Text } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import I18n from "../../i18n";
import TransactionSummaryScreen from "../../screens/wallet/payment/TransactionSummaryScreen";
import {
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../store/actions/navigation";
import { paymentInitializeState } from "../../store/actions/wallet/payment";
import { serverInfoDataSelector } from "../../store/reducers/backendInfo";
import { isProfileEmailValidatedSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { InferNavigationParams } from "../../types/react";
import { isUpdateNeeded } from "../../utils/appVersion";
import {
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../../utils/payment";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { PaymentNoticeNumber } from "../../../definitions/backend/PaymentNoticeNumber";
import { PaymentAmount } from "../../../definitions/backend/PaymentAmount";

type OwnProps = {
  organizationFiscalCode: OrganizationFiscalCode;
  noticeNumber: PaymentNoticeNumber;
  amount: PaymentAmount;
};

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  half: {
    flex: 1
  },
  marginTop1: { marginTop: 1 }
});

/**
 * A component to render the button related to the payment
 * paired with a message.
 */
const PaymentButton = (props: Props) => {
  const handleOnPress = () => {
    const amount = getAmountFromPaymentAmount(props.amount);

    const rptId = getRptIdFromNoticeNumber(
      props.organizationFiscalCode,
      props.noticeNumber
    );

    if (amount.isSome() && rptId.isSome()) {
      // TODO: optimize the management of the payment initialization
      if (props.isEmailValidated && !props.isUpdatedNeededPagoPa) {
        props.paymentInitializeState();
        props.navigateToPaymentTransactionSummaryScreen({
          rptId: rptId.value,
          initialAmount: amount.value,
          paymentStartOrigin: "message"
        });
      } else {
        // Navigating to Wallet home, having the email address is not validated,
        // it will be displayed RemindEmailValidationOverlay
        props.navigateToWalletHomeScreen();
      }
    }
  };
  return (
    <ButtonDefaultOpacity
      primary={true}
      onPress={handleOnPress}
      style={styles.half}
    >
      <Text style={styles.marginTop1}>{I18n.t("messages.cta.seeNotice")}</Text>
    </ButtonDefaultOpacity>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isEmailValidated: isProfileEmailValidatedSelector(state),
  isUpdatedNeededPagoPa: isUpdateNeeded(
    serverInfoDataSelector(state),
    "min_app_version_pagopa"
  )
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  paymentInitializeState: () => dispatch(paymentInitializeState()),
  navigateToPaymentTransactionSummaryScreen: (
    params: InferNavigationParams<typeof TransactionSummaryScreen>
  ) => dispatch(navigateToPaymentTransactionSummaryScreen(params)),
  navigateToWalletHomeScreen: () => dispatch(navigateToWalletHome())
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentButton);
