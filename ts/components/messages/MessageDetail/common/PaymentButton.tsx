import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as O from "fp-ts/lib/Option";
import { Text as NBButtonText } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PaymentAmount } from "../../../../../definitions/backend/PaymentAmount";
import { PaymentNoticeNumber } from "../../../../../definitions/backend/PaymentNoticeNumber";
import { isPagoPaSupportedSelector } from "../../../../common/versionInfo/store/reducers/versionInfo";

import I18n from "../../../../i18n";
import { TransactionSummaryScreenNavigationParams } from "../../../../screens/wallet/payment/TransactionSummaryScreen";
import {
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../../../store/actions/navigation";
import { paymentInitializeState } from "../../../../store/actions/wallet/payment";
import { useIODispatch } from "../../../../store/hooks";
import { isProfileEmailValidatedSelector } from "../../../../store/reducers/profile";
import { GlobalState } from "../../../../store/reducers/types";
import {
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../../../../utils/payment";
import ButtonDefaultOpacity from "../../../ButtonDefaultOpacity";

type OwnProps = {
  organizationFiscalCode: OrganizationFiscalCode;
  noticeNumber: PaymentNoticeNumber;
  amount: PaymentAmount;
  messageId?: string;
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
  isPagoPaSupported,
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHomeScreen,
  noticeNumber,
  organizationFiscalCode,
  messageId
}: Props) => {
  const dispatch = useIODispatch();
  const handleOnPress = () => {
    const amount = getAmountFromPaymentAmount(paymentAmount);

    const rptId = getRptIdFromNoticeNumber(
      organizationFiscalCode,
      noticeNumber
    );

    if (O.isSome(amount) && O.isSome(rptId)) {
      // TODO: optimize the management of the payment initialization
      if (isEmailValidated && isPagoPaSupported) {
        dispatch(paymentInitializeState());
        navigateToPaymentTransactionSummaryScreen({
          rptId: rptId.value,
          initialAmount: amount.value,
          paymentStartOrigin: "message",
          messageId
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
      <NBButtonText style={styles.marginTop1}>
        {I18n.t("messages.cta.seeNotice")}
      </NBButtonText>
    </ButtonDefaultOpacity>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isEmailValidated: isProfileEmailValidatedSelector(state),
  isPagoPaSupported: isPagoPaSupportedSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  paymentInitializeState: () => dispatch(paymentInitializeState()),
  navigateToPaymentTransactionSummaryScreen: (
    params: TransactionSummaryScreenNavigationParams
  ) => navigateToPaymentTransactionSummaryScreen(params),
  navigateToWalletHomeScreen: () => navigateToWalletHome()
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentButton);
