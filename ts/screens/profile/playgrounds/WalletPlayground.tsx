/* eslint-disable sonarjs/no-identical-functions */
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView } from "react-native";
import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { WalletOnboardingRoutes } from "../../../features/walletV3/onboarding/navigation/navigator";
import { WalletPaymentRoutes } from "../../../features/walletV3/payment/navigation/routes";
import { RptId } from "../../../../definitions/pagopa/ecommerce/RptId";
import { useIODispatch } from "../../../store/hooks";
import { walletPaymentInitState } from "../../../features/walletV3/payment/store/actions/orchestration";

const WalletPlayground = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToWalletOnboarding = () => {
    navigation.navigate(WalletOnboardingRoutes.WALLET_ONBOARDING_MAIN, {
      screen: WalletOnboardingRoutes.WALLET_ONBOARDING_SELECT_PAYMENT_METHOD
    });
  };

  const navigateToWalletPayment = () => {
    dispatch(walletPaymentInitState());
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_DETAIL,
      params: {
        rptId: "1234567890" as RptId
      }
    });
  };

  return (
    <BaseScreenComponent goBack>
      <ScrollView style={IOStyles.horizontalContentPadding}>
        <H2>Playground new wallet</H2>
        <Body>Choose the playground flow for the new wallet</Body>
        <VSpacer size={24} />
        {/* Onboarding Playground */}
        <ListItemNav
          value="Onboarding Playground"
          accessibilityLabel={"Onboarding Playground"}
          description="Start the onboarding flow to add a new method of payment"
          onPress={navigateToWalletOnboarding}
        />
        <Divider />
        {/* Payment Playground */}
        <ListItemNav
          value="Payment Playground"
          accessibilityLabel={"Onboarding Playground"}
          description="Start the payment flow to pay with a method of payment"
          onPress={navigateToWalletPayment}
        />
      </ScrollView>
    </BaseScreenComponent>
  );
};

export default WalletPlayground;
