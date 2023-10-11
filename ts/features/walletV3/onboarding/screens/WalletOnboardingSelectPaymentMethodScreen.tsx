import * as React from "react";
import { ScrollView } from "react-native";

import { Body, H2, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";

import { constNull } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { WalletOnboardingStackNavigation } from "../navigation/navigator";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import WalletOnboardingPaymentMethodsList from "../components/WalletOnboardingPaymentMethodsList";

const WalletOnboardingSelectPaymentMethodScreen = () => {
  const navigation = useNavigation<WalletOnboardingStackNavigation>();

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

  return (
    <TopScreenComponent goBack>
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        <PaymentMethodsHeading />
        <VSpacer size={32} />
        <WalletOnboardingPaymentMethodsList
          onSelectPaymentMethod={() => constNull}
          paymentMethods={[{} as any, {} as any]}
        />
      </ScrollView>
    </TopScreenComponent>
  );
};

export default WalletOnboardingSelectPaymentMethodScreen;
