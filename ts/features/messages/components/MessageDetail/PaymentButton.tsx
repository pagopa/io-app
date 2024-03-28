import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ButtonSolid } from "@pagopa/io-app-design-system";
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
  }
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
    <View style={styles.half}>
      <ButtonSolid
        fullWidth
        onPress={handleOnPress}
        label={I18n.t("messages.cta.seeNotice")}
        accessibilityLabel={I18n.t("messages.cta.seeNotice")}
      />
    </View>
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
