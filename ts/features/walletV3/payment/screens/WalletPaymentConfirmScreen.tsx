import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { AmountEuroCents } from "../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { FaultCategoryEnum } from "../../../../../definitions/pagopa/ecommerce/FaultCategory";
import { GatewayFaultEnum } from "../../../../../definitions/pagopa/ecommerce/GatewayFault";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { WalletPaymentFailureDetail } from "../components/WalletPaymentFailureDetail";
import { WalletPaymentRoutes } from "../navigation/routes";
import {
  walletPaymentAuthorization,
  walletPaymentCreateTransaction
} from "../store/actions/networking";
import {
  walletPaymentAuthorizationUrlSelector,
  walletPaymentDetailsSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentPickedPspSelector,
  walletPaymentTransactionSelector
} from "../store/selectors";
import { WalletPaymentFailure } from "../types/failure";

const WalletPaymentConfirmScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const paymentDetailPot = useIOSelector(walletPaymentDetailsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const authorizationUrlPot = useIOSelector(
    walletPaymentAuthorizationUrlSelector
  );
  const selectedMethodOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );
  const selectedPspOption = useIOSelector(walletPaymentPickedPspSelector);

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

  if (pot.isError(transactionPot)) {
    const failure = pipe(
      transactionPot.error,
      WalletPaymentFailure.decode,
      O.fromEither,
      // NetworkError is transformed to GENERIC_ERROR only for display purposes
      O.getOrElse<WalletPaymentFailure>(() => ({
        faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR,
        faultCodeDetail: GatewayFaultEnum.GENERIC_ERROR
      }))
    );
    const rptId = pipe(
      paymentDetailPot,
      pot.toOption,
      O.map(({ rptId }) => rptId),
      O.toUndefined
    );
    return <WalletPaymentFailureDetail rptId={rptId} failure={failure} />;
  }

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
