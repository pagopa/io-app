import * as React from "react";
import { ScrollView } from "react-native";

import { Body, H2, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";

import I18n from "../../../../i18n";
import {
  WalletOnboardingRoutes,
  WalletOnboardingStackNavigation
} from "../navigation/navigator";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import WalletOnboardingPaymentMethodsList from "../components/WalletOnboardingPaymentMethodsList";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";

const WalletOnboardingSelectPaymentMethodScreen = () => {
  const navigation = useNavigation<WalletOnboardingStackNavigation>();

  const handleSelectedPaymentMethod = (
    selectedPaymentMethod: PaymentMethodResponse
  ) => {
    navigation.navigate(WalletOnboardingRoutes.WALLET_ONBOARDING_START, {
      paymentMethodId: selectedPaymentMethod.id
    });
  };

  return (
    <TopScreenComponent goBack>
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        <PaymentMethodsHeading />
        <VSpacer size={32} />
        <WalletOnboardingPaymentMethodsList
          onSelectPaymentMethod={handleSelectedPaymentMethod}
          paymentMethods={[
            {
              id: "1",
              name: "Carta di credito",
              asset: "creditCard"
            } as PaymentMethodResponse
          ]}
        />
      </ScrollView>
    </TopScreenComponent>
  );
};

const PaymentMethodsHeading = () => (
  <>
    <H2>Aggiungi un metodo</H2>
    <VSpacer />
    <Body>
      Il metodo verrà memorizzato nel Portafoglio di IO e potrà essere
      utilizzato per effettuare pagamenti o aderire a iniziative compatibili.
    </Body>
  </>
);

export default WalletOnboardingSelectPaymentMethodScreen;
