import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
  walletPaymentChosenPaymentMethodSelector,
  walletPaymentChosenPspSelector,
  walletPaymentTransactionSelector
} from "../store/selectors";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { WalletPaymentRoutes } from "../navigation/routes";

const WalletPaymentConfirmScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const authorizationUrlPot = useIOSelector(
    walletPaymentAuthorizationUrlSelector
  );
  const selectedMethodOption = useIOSelector(
    walletPaymentChosenPaymentMethodSelector
  );
  const selectedPspOption = useIOSelector(walletPaymentChosenPspSelector);

  const isLoading =
    pot.isLoading(transactionPot) || pot.isLoading(authorizationUrlPot);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentCreateTransaction.request({ paymentNotices: [] }));
    }, [dispatch])
  );

  React.useEffect(() => {
    if (pot.isSome(authorizationUrlPot)) {
      navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME
      });
    }
  }, [authorizationUrlPot, navigation]);

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
        <VSpacer size={8} />
        <DebugPrettyPrint
          title="authorizationUrlPot"
          data={authorizationUrlPot}
        />
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentConfirmScreen };
