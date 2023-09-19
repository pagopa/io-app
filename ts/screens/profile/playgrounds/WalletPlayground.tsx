/* eslint-disable sonarjs/no-identical-functions */
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView } from "react-native";
import { Divider, VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import ListItemNav from "../../../components/ui/ListItemNav";
import { WalletOnboardingRoutes } from "../../../features/walletV3/onboarding/navigation/navigator";

const WalletPlayground = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToWalletOnboarding = () => {
    navigation.navigate(WalletOnboardingRoutes.WALLET_ONBOARDING_MAIN, {
      screen: WalletOnboardingRoutes.WALLET_ONBOARDING_START
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
          onPress={() => alert("Flow not implemented yet")}
        />
      </ScrollView>
    </BaseScreenComponent>
  );
};

export default WalletPlayground;
