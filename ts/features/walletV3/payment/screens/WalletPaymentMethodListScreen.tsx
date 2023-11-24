import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  walletPaymentGetAllMethods,
  walletPaymentGetUserWallets
} from "../store/actions";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentUserMethodsSelector
} from "../store/selectors";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import { WalletPaymentRoutes } from "../navigation/routes";

const WalletPaymentMethodListScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userMethodsPots = useIOSelector(walletPaymentUserMethodsSelector);

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(userMethodsPots);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetAllMethods.request());
      dispatch(walletPaymentGetUserWallets.request());
    }, [dispatch])
  );

  const handleContinue = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_PSP_LIST
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
        <DebugPrettyPrint title="paymentMethodsPot" data={paymentMethodsPot} />
        <VSpacer size={16} />
        <DebugPrettyPrint title="userMethodsPots" data={userMethodsPots} />
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentMethodListScreen };
