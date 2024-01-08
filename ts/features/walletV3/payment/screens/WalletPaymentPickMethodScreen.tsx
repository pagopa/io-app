import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useWalletPaymentGoBackHandler } from "../hooks/useWalletPaymentGoBackHandler";
import { WalletPaymentRoutes } from "../navigation/routes";
import {
  walletPaymentGetAllMethods,
  walletPaymentGetUserWallets
} from "../store/actions/networking";
import { walletPaymentPickPaymentMethod } from "../store/actions/orchestration";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentUserWalletsSelector
} from "../store/selectors";

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const handleGoBack = useWalletPaymentGoBackHandler();

  useHeaderSecondLevel({
    title: "",
    goBack: handleGoBack,
    supportRequest: true,
    contextualHelp: emptyContextualHelp
  });

  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(walletPaymentUserWalletsSelector);
  const selectedMethodOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(userWalletsPots);
  const canContinue = O.isSome(selectedMethodOption);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetAllMethods.request());
      dispatch(walletPaymentGetUserWallets.request());
    }, [dispatch])
  );

  const handleMethodSelection = React.useCallback(
    (wallet: WalletInfo) => {
      dispatch(walletPaymentPickPaymentMethod(wallet));
    },
    [dispatch]
  );

  const handleContinue = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP,
      params: {
        walletId: "123456",
        paymentAmountInCents: 100
      }
    });
  };

  // TODO just for testing purposes
  React.useEffect(() => {
    if (pot.isSome(userWalletsPots) && !canContinue) {
      const userWallets = userWalletsPots.value;

      if (userWallets.length > 0) {
        handleMethodSelection(userWallets[0]);
      }
    }
  }, [userWalletsPots, canContinue, handleMethodSelection]);

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Continua",
        accessibilityLabel: "Continua",
        onPress: handleContinue,
        disabled: isLoading || !canContinue,
        loading: isLoading
      }}
    >
      <DebugPrettyPrint title="paymentMethodsPot" data={paymentMethodsPot} />
      <VSpacer size={16} />
      <DebugPrettyPrint title="userWalletsPots" data={userWalletsPots} />
    </GradientScrollView>
  );
};

export { WalletPaymentPickMethodScreen };
