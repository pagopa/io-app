import { GradientScrollView } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentCalculateFees } from "../store/actions/networking";
import { walletPaymentPickPsp } from "../store/actions/orchestration";
import {
  walletPaymentAmountSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentPickedPspSelector,
  walletPaymentPspListSelector
} from "../store/selectors";

const WalletPaymentPickPspScreen = () => {
  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const selectedWalletOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const isLoading = pot.isLoading(pspListPot);

  const selectedPspOption = useIOSelector(walletPaymentPickedPspSelector);

  const canContinue = O.isSome(selectedPspOption);

  const walletId = pipe(
    selectedWalletOption as O.Option<WalletInfo>,
    O.fold(
      () => "",
      (wallet: WalletInfo) => wallet.walletId
    )
  );
  const paymentAmountInCents = pot.getOrElse(paymentAmountPot, 99999999);
  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        walletPaymentCalculateFees.request({ walletId, paymentAmountInCents })
      );
    }, [dispatch, walletId, paymentAmountInCents])
  );

  const handlePspSelection = React.useCallback(
    (bundle: Bundle) => {
      dispatch(walletPaymentPickPsp(bundle));
    },
    [dispatch]
  );

  // TODO just for testing purposes
  React.useEffect(() => {
    if (pot.isSome(pspListPot) && !canContinue) {
      const pspList = pspListPot.value;

      if (pspList.length > 0) {
        handlePspSelection(pspList[0]);
      }
    }
  }, [pspListPot, canContinue, handlePspSelection]);

  const handleContinue = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_CONFIRM
    });
  };

  return (
    <BaseScreenComponent goBack={true}>
      <GradientScrollView
        primaryActionProps={{
          label: "Continua",
          accessibilityLabel: "Continua",
          onPress: handleContinue,
          disabled: isLoading,
          loading: isLoading
        }}
      >
        <DebugPrettyPrint title="pspListPot" data={pspListPot} />
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentPickPspScreen };
