import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { AmountEuroCents } from "../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  walletPaymentAuthorization,
  walletPaymentCreateTransaction
} from "../store/actions/networking";
import {
  walletPaymentAuthorizationUrlSelector,
  walletPaymentTransactionSelector
} from "../store/selectors";

const WalletPaymentReviewScreen = () => {
  const dispatch = useIODispatch();

  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const authorizationUrlPot = useIOSelector(
    walletPaymentAuthorizationUrlSelector
  );

  const isLoading =
    pot.isLoading(transactionPot) || pot.isLoading(authorizationUrlPot);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentCreateTransaction.request({ paymentNotices: [] }));
    }, [dispatch])
  );

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleStartPaymentAuthorization = () => {
    dispatch(
      walletPaymentAuthorization.request({
        paymentAmount: 1000 as AmountEuroCents,
        paymentFees: 1000 as AmountEuroCents,
        pspId: "A",
        transactionId: "A",
        walletId: "A"
      })
    );
  };

  return (
    <BaseScreenComponent goBack={true}>
      <GradientScrollView
        primaryActionProps={{
          label: "Paga xx,xx €",
          accessibilityLabel: "Paga xx,xx €",
          onPress: handleStartPaymentAuthorization,
          disabled: isLoading,
          loading: isLoading
        }}
      >
        <DebugPrettyPrint title="transactionPot" data={transactionPot} />
        <VSpacer size={16} />
        <DebugPrettyPrint
          title="authorizationUrlPot"
          data={authorizationUrlPot}
        />
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentReviewScreen };
