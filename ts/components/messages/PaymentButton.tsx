import { Text } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";

import I18n from "../../i18n";
import NavigationService from "../../navigation/NavigationService";
import TransactionSummaryScreen from "../../screens/wallet/payment/TransactionSummaryScreen";
import {
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../store/actions/navigation";
import { paymentInitializeState } from "../../store/actions/wallet/payment";
import { useIODispatch } from "../../store/hooks";
import { versionInfoDataSelector } from "../../common/versionInfo/store/reducers/versionInfo";
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
const PaymentButton = ({
  amount: paymentAmount,
  isEmailValidated,
  isUpdatedNeededPagoPa,
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHomeScreen,
  noticeNumber,
  organizationFiscalCode
}: Props) => {
  const dispatch = useIODispatch();
  const handleOnPress = () => {
    const amount = getAmountFromPaymentAmount(paymentAmount);

    const rptId = getRptIdFromNoticeNumber(
      organizationFiscalCode,
      noticeNumber
    );

    if (amount.isSome() && rptId.isSome()) {
      // TODO: optimize the management of the payment initialization
      if (isEmailValidated && !isUpdatedNeededPagoPa) {
        dispatch(paymentInitializeState());
        navigateToPaymentTransactionSummaryScreen({
          rptId: rptId.value,
          initialAmount: amount.value,
          paymentStartOrigin: "message",
          startRoute: NavigationService.getCurrentRoute()
        });
      } else {
        // Navigating to Wallet home, having the email address is not validated,
        // it will be displayed RemindEmailValidationOverlay
        navigateToWalletHomeScreen();
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
    versionInfoDataSelector(state),
    "min_app_version_pagopa"
  )
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  paymentInitializeState: () => dispatch(paymentInitializeState()),
  navigateToPaymentTransactionSummaryScreen: (
    params: InferNavigationParams<typeof TransactionSummaryScreen>
  ) => navigateToPaymentTransactionSummaryScreen(params),
  navigateToWalletHomeScreen: () => navigateToWalletHome()
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentButton);
