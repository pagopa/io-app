import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";
import { AmountEuroCents } from "../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useWalletPaymentAuthorizationModal } from "../hooks/useWalletPaymentAuthorizationModal";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentCreateTransaction } from "../store/actions/networking";
import {
  walletPaymentChosenPaymentMethodSelector,
  walletPaymentChosenPspSelector,
  walletPaymentTransactionSelector
} from "../store/selectors";
import { WalletPaymentOutcome } from "../types/PaymentOutcomeEnum";

const WalletPaymentConfirmScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const selectedMethodOption = useIOSelector(
    walletPaymentChosenPaymentMethodSelector
  );
  const selectedPspOption = useIOSelector(walletPaymentChosenPspSelector);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentCreateTransaction.request({ paymentNotices: [] }));
    }, [dispatch])
  );

  const handleAuthorizationOutcome = (outcome: WalletPaymentOutcome) => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME,
      params: {
        outcome
      }
    });
  };

  const { isLoading: isLoadingAuthorizationUrl, startPaymentAuthorizaton } =
    useWalletPaymentAuthorizationModal({
      onAuthorizationOutcome: handleAuthorizationOutcome
    });

  const handleStartPaymentAuthorization = () =>
    startPaymentAuthorizaton({
      paymentAmount: 1000 as AmountEuroCents,
      paymentFees: 1000 as AmountEuroCents,
      pspId: "A",
      transactionId: "A",
      walletId: "A"
    });

  const isLoading = pot.isLoading(transactionPot) || isLoadingAuthorizationUrl;

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
        <DebugPrettyPrint
          title="selectedMethodOption"
          data={selectedMethodOption}
          startCollapsed={true}
        />
        <VSpacer size={8} />
        <DebugPrettyPrint
          title="selectedPspOption"
          data={selectedPspOption}
          startCollapsed={true}
        />
        <VSpacer size={8} />
        <DebugPrettyPrint title="transactionPot" data={transactionPot} />
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentConfirmScreen };
